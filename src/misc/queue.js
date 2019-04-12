export default {
  head: null,
  tail: null,
  __length__: 0,
  enqueue(item) {
    this.__length__++
    const newNode = {
      next: this.head,
      prev: null,
      value: item
    }
    if (!this.head) {
      this.head = newNode
      this.tail = newNode
      return this.__length__
    }
    this.head.prev = newNode
    this.head = newNode
    return this.__length__
  },
  dequeue() {
    if (this.isEmpty())
      throw new Error("Queue is empty, can't dequeue")
    this.__length__--
    const erasedNode = this.tail
    this.tail = this.tail.next
    this.tail.prev = null
    return erasedNode
  },
  clear() {
    this.head = null
    this.tail = null
    this.__length__ = 0
  },
  isEmpty() {
    return this.__length__ === 0
  },
  each(cb) {
    let curNode = this.head
    for (let i = 0; i < this.__length__; i++) {
      cb(curNode.value, i)
      curNode = curNode.next
    }
  },
  has(el) {
    let curNode = this.head
    for (let i = 0; i < this.__length__; i++)
      if (curNode.value === el) return true
      else curNode = curNode.next
    return false
  },
  getLength() {
    return this.__length__
  },
  getHead() {
    return this.head.value
  },
  pop() {
    this.head = this.head.next
    return this.__length__
  }
}
