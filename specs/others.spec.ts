import * as assert from 'node:assert'
import { openSync, readSync } from 'node:fs'
import { resolve } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { disableTypes, imageSize, types } from '../lib'
import { imageSizeFromFile } from '../lib/fromFile'

// If something other than a buffer or filepath is passed
describe('Invalid invocation', () => {
  describe('malformed ICNS entries', () => {
    it('rejects a zero-length entry instead of looping indefinitely', () => {
      const input = new Uint8Array([
        0x69,
        0x63,
        0x6e,
        0x73, // icns
        0x00,
        0x00,
        0x00,
        0x10, // file length
        0x69,
        0x63,
        0x30,
        0x37, // ic07
        0x00,
        0x00,
        0x00,
        0x00, // invalid entry length
      ])

      assert.throws(
        () => imageSize(input),
        /Invalid ICNS, invalid image entry length/,
      )
    })
  })

  describe('passing buffer for tiff', () => {
    const bufferSize = 2048
    const file = 'specs/images/valid/tiff/little-endian.tiff'

    it('should throw', () => {
      const buffer = new Uint8Array(bufferSize)
      const filepath = resolve(file)
      const descriptor = openSync(filepath, 'r')
      readSync(descriptor, buffer, 0, bufferSize, 0)
      assert.throws(
        () => imageSize(buffer),
        TypeError,
        'Invalid Tiff. Missing tags',
      )
    })
  })

  describe('for a disabled image type', () => {
    before(() => disableTypes(['jpg', 'bmp']))
    after(() => disableTypes([]))

    it('should throw', async () => {
      await assert.rejects(
        () => imageSizeFromFile('specs/images/valid/jpg/sample.jpg'),
        TypeError,
        'disabled file type: jpg',
      )
      await assert.rejects(
        () => imageSizeFromFile('specs/images/valid/bmp/sample.bmp'),
        TypeError,
        'disabled file type: bmp',
      )
      await assert.doesNotReject(() =>
        imageSizeFromFile('specs/images/valid/png/sample.png'),
      )
    })
  })
})

describe('.types property', () => {
  it('should expose supported file types', () => {
    assert.deepEqual(types, [
      'bmp',
      'cur',
      'dds',
      'gif',
      'heif',
      'icns',
      'ico',
      'j2c',
      'jp2',
      'jpg',
      'jxl',
      'jxl-stream',
      'ktx',
      'png',
      'pnm',
      'psd',
      'svg',
      'tga',
      'tiff',
      'webp',
    ])
  })
})
