import { getEnv } from "./config.js";
import { createApp } from "./app.js";

async function main() {
  const env = getEnv();

  const app = createApp();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on ${env.PUBLIC_BASE_URL}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
