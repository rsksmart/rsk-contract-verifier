import { expect } from 'chai'
import { forkedService, suicidalService } from '../src/lib/Services'

const script = '../../test/testService.js'

describe('Services', function () {

  describe(`# forkedService`, function () {

    it(`missing module should throw an error`, () => {
      expect(() => forkedService('./foo')).to.throw()
    })

    it(`should create a service`, () => {
      const service = forkedService(script)
      expect(service).has.ownProperty('killed').equal(false)
      const killed = service.kill()
      expect(service.killed).to.be.equal(killed).to.be.equal(true)
      expect(service).has.ownProperty('exitCode').eq(null)
    })
  })

  describe(`# suicidalService`, function () {

    it(`should return a resolved promise`, async () => {
      const service = forkedService(script)
      const payload = { test: 'test' }
      const result = await suicidalService(service, { payload })
      expect(result).to.be.an('object')
      expect(result).to.be.deep.equal(payload)
      expect(service.killed).to.be.deep.equal(true)
      expect(service).has.ownProperty('exitCode').eq(null)
    })

    it(`should return an error`, async () => {
      const service = forkedService(script)
      const error = 'test Error'
      const payload = { error }
      const result = await suicidalService(service, { payload }).catch(err => err)
      expect(result).to.be.instanceOf(Error).with.property('message').eq(error)
    })

    it(`should return a rejected promise`, async () => {
      const service = forkedService(script)
      const payload = { FAIL: 'generated error' }
      const result = await suicidalService(service, { payload }).catch(err => err)
      expect(result).to.be.instanceOf(Error)
    })
  })
})
