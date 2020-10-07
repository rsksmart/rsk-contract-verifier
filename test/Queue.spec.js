import { expect } from 'chai'
import { Queue } from '../src/lib/Queue'
import { isHexString } from '@rsksmart/rsk-utils'

describe(`# Queue`, function () {
  describe(`queued()`, function () {
    const queue = Queue()
    it('should be 0', () => {
      expect(queue.queued()).to.be.equal(0)
    })
  })

  describe(`add(), remove()`, () => {
    const queue = Queue()
    const id = queue.add({})
    it('should return a valid id', () => {
      expect(id).to.be.an('string')
      expect(isHexString(id)).to.be.equal(true)
    })

    it('queue size should be 1', () => {
      expect(queue.queued()).to.be.equal(1)
    })

    it(`should remove an element`, () => {
      queue.remove(id)
      expect(queue.queued()).to.be.equal(0)
    })
  })

  describe(`get`, () => {
    const queue = Queue()
    it('should return an element by id', () => {
      const value = 'test'
      const id = queue.add(value)
      expect(queue.get(id)).to.be.deep.equal(value)
    })
  })

  describe(`next`, () => {
    const { queue, values, ids } = testQueue()
    it(`should return elements in reverse order`, () => {
      values.forEach((v, i) => {
        const [id, task] = queue.next()
        expect(id).to.be.equal(ids[i])
        expect(task()).to.be.deep.equal(v)
      })
    })
    it(`queue should be empty`, () => {
      expect(queue.queued()).to.be.deep.equal(0)
    })
  })
})

function testQueue () {
  const queue = Queue()
  const values = [1, 2, 3]
  const ids = values.map(v => queue.add(() => v))
  return { queue, values, ids }
}