import { snapshot } from '@japa/snapshot'
import { Assert, assert } from '@japa/assert'
import { expectTypeOf } from '@japa/expect-type'
import { processCLIArgs, configure, run } from '@japa/runner'

Assert.macro('validationErrors', async function (this: Assert, promiseLike, messages) {
  let hasFailed = false

  try {
    await promiseLike
  } catch (error) {
    hasFailed = true
    this.deepEqual(error.messages, messages)
  }

  if (!hasFailed) {
    throw new Error('Expected validation to fail, but passed')
  }
})

Assert.macro('validationOutput', async function (this: Assert, promiseLike, messages) {
  this.deepEqual(await promiseLike, messages)
})

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
processCLIArgs(process.argv.slice(2))
configure({
  suites: [
    {
      name: 'unit',
      files: ['tests/unit/**/*.spec(.js|.ts)'],
    },
    {
      name: 'integration',
      files: ['tests/integration/**/*.spec(.js|.ts)'],
    },
  ],
  plugins: [assert(), expectTypeOf(), snapshot()],
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
