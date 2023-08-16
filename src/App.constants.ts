export const HOST_URL = 'http://localhost:3000';

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJpdmFsZW50eW4iLCJpYXQiOjE2OTE3NjU4MzV9.zE6rpSm_lVy6wxVNp6fsf4F2aAom38ryAU-V11_dftk';

export const getHeadersWithAuthorizationToken = () => ({
  headers: { Authorization: AUTH_TOKEN },
});
