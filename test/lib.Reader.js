// Copyright 2013 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an 
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific 
// language governing permissions and limitations under the License.
'use strict';
/*jshint expr:true*/

var should = require('should');
var lib = require('./hdb').lib;
var bignum = lib.util.bignum;

describe('Lib', function () {

  describe('#Reader', function () {

    it('should read a TinyInt', function () {
      var len = 1;
      var offset = 0;
      var buffer = new Buffer(1 + (2 * (len + 1)));
      // null
      buffer[offset++] = 0;
      // 1
      buffer[offset++] = 1;
      buffer.writeUInt8(1, offset);
      offset += len;
      // 255
      buffer[offset++] = 1;
      buffer.writeUInt8(255, offset);
      offset += len;
      var reader = new lib.Reader(buffer);
      should(reader.readTinyInt() === null).ok;
      reader.hasMore().should.equal(true);
      reader.readTinyInt().should.equal(1);
      reader.hasMore().should.equal(true);
      reader.readTinyInt().should.equal(255);
      reader.hasMore().should.equal(false);
    });


    it('should read a SmallInt', function () {
      var len = 2;
      var offset = 0;
      var buffer = new Buffer(1 + (2 * (len + 1)));
      // null
      buffer[offset++] = 0;
      // -1
      buffer[offset++] = 1;
      buffer.writeInt16LE(-1, offset);
      offset += len;
      // 256
      buffer[offset++] = 1;
      buffer.writeInt16LE(256, offset);
      offset += len;
      var reader = new lib.Reader(buffer);
      should(reader.readSmallInt() === null).ok;
      reader.readSmallInt().should.equal(-1);
      reader.readSmallInt().should.equal(256);
      reader.hasMore().should.equal(false);
    });

    it('should read a Int', function () {
      var len = 4;
      var offset = 0;
      var buffer = new Buffer(1 + (2 * (len + 1)));
      // null
      buffer[offset++] = 0;
      // -1
      buffer[offset++] = 1;
      buffer.writeInt32LE(-1, offset);
      offset += len;
      // 32754
      buffer[offset++] = 1;
      buffer.writeInt32LE(32754, offset);
      offset += len;
      var reader = new lib.Reader(buffer);
      should(reader.readInt() === null).ok;
      reader.readInt().should.equal(-1);
      reader.readInt().should.equal(32754);
      reader.hasMore().should.equal(false);
    });

    it('should read a BigInt', function () {
      var len = 8;
      var offset = 0;
      var buffer = new Buffer(1 + (2 * (len + 1)));
      // null
      buffer[offset++] = 0;
      // -1
      buffer[offset++] = 1;
      bignum.writeInt64LE(buffer, -1, offset);
      offset += len;
      // 9007199254740992
      buffer[offset++] = 1;
      bignum.writeInt64LE(buffer, 9007199254740992, offset);
      offset += len;
      var reader = new lib.Reader(buffer);
      should(reader.readBigInt() === null).ok;
      reader.readBigInt().should.equal(-1);
      reader.readBigInt().should.equal(9007199254740992);
      reader.hasMore().should.equal(false);
    });

    it('should read a Double', function () {
      var buffer = new Buffer([
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x7f,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0xff,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf1, 0x7f,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xf0, 0x3f
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readDouble() === null).ok;
      reader.readDouble().should.equal(Number.POSITIVE_INFINITY);
      reader.readDouble().should.equal(Number.NEGATIVE_INFINITY);
      isNaN(reader.readDouble()).should.be.ok;
      reader.readDouble().should.equal(1);
      reader.hasMore().should.equal(false);
    });

    it('should read a Float', function () {
      var buffer = new Buffer([
        0xff, 0xff, 0xff, 0xff,
        0x00, 0x00, 0x80, 0x7f,
        0x00, 0x00, 0x80, 0xff,
        0x00, 0x00, 0x81, 0x7f,
        0x00, 0x00, 0x80, 0x3f
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readFloat() === null).ok;
      reader.readFloat().should.equal(Number.POSITIVE_INFINITY);
      reader.readFloat().should.equal(Number.NEGATIVE_INFINITY);
      isNaN(reader.readFloat()).should.be.ok;
      reader.readFloat().should.equal(1);
      reader.hasMore().should.equal(false);
    });

    it('should read a Decimal', function () {
      var buffer = new Buffer(32);
      buffer.fill(0x00);
      buffer[15] = 0x70;
      buffer[16] = 0x01;
      buffer[30] = 0x40;
      buffer[31] = 0x30;
      var reader = new lib.Reader(buffer);
      should(reader.readDecimal(0) === null).ok;
      reader.readDecimal(35).should.equal('1e+0');
      reader.hasMore().should.equal(false);
    });

    it('should read a String', function () {
      var buffer = new Buffer([0xff, 4, 0xF0, 0xA4, 0xAD, 0xA2]);
      var reader = new lib.Reader(buffer);
      should(reader.readString() === null).ok;
      reader.readString().should.equal('𤭢');
      reader.hasMore().should.equal(false);
    });

    it('should read a Binary', function () {
      var buffer = new Buffer([0xff, 4, 0xF0, 0xA4, 0xAD, 0xA2]);
      var reader = new lib.Reader(buffer);
      should(reader.readBinary() === null).ok;
      reader.readBinary().should.eql(buffer.slice(2));
      reader.hasMore().should.equal(false);
    });

    it('should read 255 Bytes', function () {
      var len = 255;
      var buffer = new Buffer(len + 3);
      buffer[0] = 0xf6;
      buffer.writeInt16LE(len, 1);
      var reader = new lib.Reader(buffer);
      reader.readBinary().should.eql(buffer.slice(3));
      reader.hasMore().should.equal(false);
    });

    it('should read 32787 Bytes', function () {
      var len = 32787;
      var buffer = new Buffer(len + 5);
      buffer[0] = 0xf7;
      buffer.writeInt32LE(len, 1);
      var reader = new lib.Reader(buffer);
      reader.readBinary().should.eql(buffer.slice(5));
      reader.hasMore().should.equal(false);
    });

    it('should read a Date', function () {
      var buffer = new Buffer([
        0xff, 0x7f, 0x00, 0x00,
        0x01, 0x80, 0x00, 0x01,
        0x0f, 0xa7, 0x0b, 0x1f
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readDate() === null).ok;
      reader.readDate().should.equal('0001-01-01');
      reader.readDate().should.equal('9999-12-31');
      reader.hasMore().should.equal(false);
    });

    it('should read a Time', function () {
      var buffer = new Buffer([
        0x7f, 0xff, 0x00, 0x00,
        0x81, 0x01, 0xe8, 0x03
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readTime() === null).ok;
      reader.readTime().should.equal('01:01:01');
      reader.hasMore().should.equal(false);
    });

    it('should read a Timestamp', function () {
      var buffer = new Buffer([
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x81, 0x01, 0xe8, 0x03,
        0xde, 0x87, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0xde, 0x87, 0x00, 0x01, 0x81, 0x01, 0xe8, 0x03
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readTimestamp() === null).ok;
      reader.readTimestamp().should.equal('0001-01-01T01:01:01');
      reader.readTimestamp().should.equal('2014-01-01T00:00:00');
      reader.readTimestamp().should.equal('2014-01-01T01:01:01');
      reader.hasMore().should.equal(false);
    });

    it('should read a DayDate', function () {
      var buffer = new Buffer([
        0x00, 0x00, 0x00, 0x00,
        0xde, 0xb9, 0x37, 0x00,
        0x02, 0x00, 0x00, 0x00
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readDayDate() === null).ok;
      should(reader.readDayDate() === null).ok;
      reader.readDayDate().should.equal(1);
      reader.hasMore().should.equal(false);
    });

    it('should read a SecondTime', function () {
      var buffer = new Buffer([
        0x00, 0x00, 0x00, 0x00,
        0x82, 0x51, 0x01, 0x00,
        0x02, 0x00, 0x00, 0x00
      ]);
      var reader = new lib.Reader(buffer);
      should(reader.readSecondTime() === null).ok;
      should(reader.readSecondTime() === null).ok;
      reader.readSecondTime().should.equal(1);
      reader.hasMore().should.equal(false);
    });

    it('should read a SecondDate', function () {
      var buffer = new Buffer(24);
      buffer.fill(0x00, 0, 8);
      bignum.writeInt64LE(buffer, 315538070401, 8);
      bignum.writeInt64LE(buffer, 2, 16);
      var reader = new lib.Reader(buffer);
      should(reader.readSecondDate() === null).ok;
      should(reader.readSecondDate() === null).ok;
      reader.readSecondDate().should.equal(1);
      reader.hasMore().should.equal(false);
    });


    it('should read a LongDate', function () {
      var buffer = new Buffer(24);
      buffer.fill(0x00, 0, 8);
      bignum.writeInt64LE(buffer, '3155380704000000001', 8);
      bignum.writeInt64LE(buffer, 2, 16);
      var reader = new lib.Reader(buffer);
      should(reader.readLongDate() === null).ok;
      should(reader.readLongDate() === null).ok;
      reader.readLongDate().should.equal(1);
      reader.hasMore().should.equal(false);
    });
  });


});