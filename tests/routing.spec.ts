import { expect, test } from '@playwright/test';

for (const host of ['localhost:3107', '127.0.0.1:3107', 'participant.example']) {
  test(`ルートの画面誘導を維持する: ${host}`, async ({ request }) => {
    const response = await request.get('/', {
      headers: { host },
      maxRedirects: 0,
    });
    if (host === 'participant.example') {
      expect(response.status()).toBe(307);
      expect(new URL(response.headers().location, response.url()).pathname).toBe('/sonar');
    } else {
      expect(response.status()).toBe(200);
    }
  });
}

test('参加者画面から再度転送しない', async ({ request }) => {
  const response = await request.get('/sonar', {
    headers: { host: 'participant.example' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(200);
});
