const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { createServer } = require('node:net');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

function currentBogotaDate() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

test('FinControl API: inicio de sesión, metas, presupuestos y avisos', { timeout: 30_000 }, async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fincontrol-api-test-'));
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const backupToken = 'test-only-backup-token';
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      DATABASE_URL: '',
      FINCONTROL_DATA_DIR: dataDir,
      JWT_SECRET: 'test-only-jwt-secret-with-sufficient-length',
      BACKUP_TOKEN: backupToken,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  server.stdout.on('data', chunk => { serverOutput += chunk; });
  server.stderr.on('data', chunk => { serverOutput += chunk; });

  async function request(url, options) {
    return fetch(`${baseUrl}${url}`, options);
  }

  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (server.exitCode !== null) throw new Error(`El servidor terminó antes de iniciar.\n${serverOutput}`);
      try {
        const response = await request('/api/health');
        if (response.ok) { ready = true; break; }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(ready, true, `El servidor no inició a tiempo.\n${serverOutput}`);

    const health = await request('/api/health');
    assert.deepEqual(await health.json(), { status: 'ok', database: 'SQLite conectada' });

    const protectedGoals = await request('/api/goals');
    assert.equal(protectedGoals.status, 401, 'las rutas privadas deben requerir sesión');

    const invalidRegistration = await request('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pruebas', email: 'invalido', password: 'corta' }),
    });
    assert.equal(invalidRegistration.status, 400, 'el registro debe validar correo y contraseña');

    const registration = await request('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cuenta de pruebas', email: 'FINCONTROL.TEST@example.com', password: 'Pruebas123' }),
    });
    assert.equal(registration.status, 201);
    const account = await registration.json();
    assert.equal(account.user.email, 'fincontrol.test@example.com');
    assert.ok(account.token);

    const duplicateRegistration = await request('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Cuenta duplicada', email: 'fincontrol.test@example.com', password: 'Pruebas123' }),
    });
    assert.equal(duplicateRegistration.status, 409, 'el correo no se puede registrar dos veces');

    const wrongLogin = await request('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fincontrol.test@example.com', password: 'incorrecta123' }),
    });
    assert.equal(wrongLogin.status, 401, 'un password incorrecto no debe iniciar sesión');

    const login = await request('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'FINCONTROL.TEST@example.com', password: 'Pruebas123' }),
    });
    assert.equal(login.status, 200);
    const session = await login.json();
    const auth = { Authorization: `Bearer ${session.token}` };
    const currentUserResponse = await request('/api/me', { headers: auth });
    assert.deepEqual(await currentUserResponse.json(), session.user, 'el navegador puede confirmar la identidad actual al restaurar sesión');
    const secondRegistration = await request('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Segunda cuenta', email: 'otra.cuenta@example.com', password: 'Cuenta1234' }),
    });
    assert.equal(secondRegistration.status, 201);
    const secondSession = await secondRegistration.json();
    const secondMe = await request('/api/me', { headers: { Authorization: `Bearer ${secondSession.token}` } });
    assert.deepEqual(await secondMe.json(), secondSession.user, 'una sesión nueva debe resolver el nombre de la cuenta actual');
    const firstMeAfterSecondLogin = await request('/api/me', { headers: auth });
    assert.deepEqual(await firstMeAfterSecondLogin.json(), session.user, 'cada token conserva la identidad de su cuenta');
    const categoriesResponse = await request('/api/categories', { headers: auth });
    const categories = await categoriesResponse.json();
    assert.equal(categories.length, 9, 'el registro crea las categorías iniciales');
    const household = categories.find(category => category.name === 'Hogar' && category.type === 'expense');
    assert.ok(household, 'debe existir la categoría de gasto Hogar');

    const missingMeta = await request('/api/goals', {
      method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vacaciones', target_amount: 0, deadline: currentBogotaDate() }),
    });
    assert.equal(missingMeta.status, 400, 'una meta debe exigir un monto objetivo positivo');

    const deadline = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
    const goalResponse = await request('/api/goals', {
      method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Viaje de prueba', target_amount: 500_000, deadline }),
    });
    assert.equal(goalResponse.status, 201);
    const goalCreated = await goalResponse.json();
    assert.ok(goalCreated.id);
    const goalsResponse = await request('/api/goals', { headers: auth });
    const goals = await goalsResponse.json();
    assert.equal(goals.length, 1);
    assert.equal(goals[0].name, 'Viaje de prueba');

    const today = currentBogotaDate();
    const month = today.slice(0, 7);
    const budgetResponse = await request('/api/budgets', {
      method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: household.id, month, amount: 100_000 }),
    });
    assert.equal(budgetResponse.status, 200);

    async function addExpense(amount) {
      return request('/api/movements', {
        method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: household.id, type: 'expense', amount, movement_date: today, description: 'Prueba de presupuesto' }),
      });
    }
    assert.equal((await addExpense(85_000)).status, 201);
    let alertsResponse = await request('/api/alerts', { headers: auth });
    let alerts = await alertsResponse.json();
    assert.deepEqual(alerts.map(alert => alert.threshold), [80], 'al superar 80% debe generarse un aviso');

    assert.equal((await addExpense(25_000)).status, 201);
    alertsResponse = await request('/api/alerts', { headers: auth });
    alerts = await alertsResponse.json();
    assert.deepEqual(alerts.map(alert => alert.threshold).sort((a, b) => a - b), [80, 100], 'al superar 100% debe generar el segundo aviso');
    assert.ok(alerts.every(alert => !alert.is_read));

    const unauthorizedBackup = await request('/api/backup');
    assert.equal(unauthorizedBackup.status, 401, 'el respaldo debe estar protegido');
    const backupResponse = await request('/api/backup', { headers: { Authorization: `Bearer ${backupToken}` } });
    assert.equal(backupResponse.status, 200);
    assert.match(backupResponse.headers.get('content-disposition'), /fincontrol\.sqlite/);
    assert.ok((await backupResponse.arrayBuffer()).byteLength > 0);

    const home = await request('/');
    assert.equal(home.status, 200);
    assert.match(await home.text(), /FinControl/);
    const appScript = await request('/app.js');
    const appSource = await appScript.text();
    assert.match(appSource, /validationPage/, 'la sección de pruebas debe estar publicada en la interfaz');
    assert.match(appSource, /notificationIcon\(\)/, 'las alertas deben usar el ícono de campana');
  } finally {
    if (server.exitCode === null) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise(resolve => server.once('exit', resolve)),
        new Promise(resolve => setTimeout(resolve, 3_000)),
      ]);
      if (server.exitCode === null) server.kill('SIGKILL');
    }
    await fs.rm(dataDir, { recursive: true, force: true });
  }
});
