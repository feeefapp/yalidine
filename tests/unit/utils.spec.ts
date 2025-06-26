import { test } from '@japa/runner'
import { convertDartColorToCssNumber } from '../../src/index.js'

test.group('Utils', () => {
  test('convertDartColorToCss', ({ assert }) => {
    const dartColor = 0xff0000ff // Red with full opacity
    const cssColor = convertDartColorToCssNumber(dartColor)
    assert.equal(cssColor, 0x0000ffff)
  })
})
