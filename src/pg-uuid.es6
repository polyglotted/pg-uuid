import {assert} from 'chai';
import secureRandom from 'secure-random';
import Long from 'pg-long';

let digits,
    getSigBits;

/** Returns val represented by the specified number of hex digits. */
digits = (val, dig) => {
  let hi = Long.ONE.shiftLeft(dig * 4);
  return Long.toHexString(hi.or(val.and(hi.subtract(Long.ONE)))).substring(1);
};

getSigBits = (data) => {
  assert.isArray(data);
  assert.equal(data.length, 16);

  let msb = Long.ZERO,
      lsb = Long.ZERO,
      i;

  for (i = 0; i < 8; i++) {
    msb = msb.shiftLeft(8).or(Long.fromNumber(data[i] & 0xff));
  }

  for (i = 8; i < 16; i++) {
    lsb = lsb.shiftLeft(8).or(Long.fromNumber(data[i] & 0xff));
  }

  return [msb, lsb];
};

class UUID {
  constructor (mostSigBits, leastSigBits) {
    assert.instanceOf(mostSigBits, Long);
    assert.instanceOf(leastSigBits, Long);
    this.mostSigBits = mostSigBits;
    this.leastSigBits = leastSigBits;
  }

  get msb () {
    return this.mostSigBits;
  }

  get lsb () {
    return this.leastSigBits;
  }

  equals (other) {
    return other instanceof UUID && this.msb.equals(other.msb) && this.lsb.equals(other.lsb);
  }

  static randomUUID () {
    let randomBytes = secureRandom(16),
        sigBits;
    randomBytes[6] &= 0x0f;  /* clear version        */
    randomBytes[6] |= 0x40;  /* set to version 4     */
    randomBytes[8] &= 0x3f;  /* clear variant        */
    randomBytes[8] |= 0x80;  /* set to IETF variant  */
    sigBits = getSigBits(randomBytes);
    return new UUID(sigBits[0], sigBits[1]);
  }

  static fromString (name) {
    assert.isString(name);
    let components = name.split('-'),
        i, mostSigBits, leastSigBits;
    assert.equal(components.length, 5);
    for (i = 0; i < 5; i++) {
      components[i] = '0x' + components[i];
    }

    mostSigBits = Long.fromNumber(components[0]);
    mostSigBits = mostSigBits.shiftLeft(16);
    mostSigBits = mostSigBits.or(Long.fromNumber(components[1]));
    mostSigBits = mostSigBits.shiftLeft(16);
    mostSigBits = mostSigBits.or(Long.fromNumber(components[2]));

    leastSigBits = Long.fromNumber(components[3]);
    leastSigBits = leastSigBits.shiftLeft(48);
    leastSigBits = leastSigBits.or(Long.fromNumber(components[4]));

    return new UUID(mostSigBits, leastSigBits);
  }

  static fromBytes (bytes) {
    assert.isArray(bytes);
    assert.equal(bytes.length, 16);
    return new UUID(Long.fromBytes(bytes.slice(0, 8)), Long.fromBytes(bytes.slice(8)));
  }

  toBytes () {
    return this.mostSigBits.toBytes(8).concat(this.leastSigBits.toBytes(8));
  }

  toString () {
    return (digits(this.mostSigBits.shiftRight(32), 8) + '-' +
            digits(this.mostSigBits.shiftRight(16), 4) + '-' +
            digits(this.mostSigBits, 4) + '-' +
            digits(this.leastSigBits.shiftRight(48), 4) + '-' +
            digits(this.leastSigBits, 12));
  }
}

export default UUID;
