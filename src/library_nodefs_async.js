
// Copyright 2013 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.
mergeInto(LibraryManager.library, {
  //$AsyncFSImpl__postset: 'fs = require("fs");',
  $AsyncFSImpl: {
    open: function(pathname, flags, mode, wakeUp) {
      const path = NODEJS_PATH.join(process.cwd(), pathname)
      fs.open(path, NODEFS.flagsForNode(flags), mode, function (err, fd) {
        if (err) {
          console.log('err', err.message)
          wakeUp(-1)
        } else {
          console.log('FD ', fd)
          wakeUp(fd)
        }
      })
    },
    llseek: function (fd, highOffset, lowOffset, result, whence, wakeUp) {
      wakeUp(0)
      console.log(arguments)
    },
    readv: function (fd, iovs, wakeUp) {
      let readCount = 0
      console.log("starting to read " + fs.read)
      ;(function read (index) {
        console.log("iov index " + index)
        const iov = iovs[index]
        fs.read(fd, Module.HEAPU8, iov.ptr, iov.len, null, function (err, bytesRead) {
          if (err) {
            wakeUp(-1)
          } else {
            readCount += bytesRead
            if (index < iovs.length - 1) {
              console.log("calling read again " + read + " index " + index)
              read(index + 1)
            } else {
              console.log("calling wake up with " + wakeUp + " read count" + readCount)
              wakeUp(readCount)
            }
          }
        })
      })(0)
    },
    access: function (path, amode, wakeUp) {
      fs.access(NODEJS_PATH.join(process.cwd(), path), amode, function (err) {
        if (err) {
          wakeUp(-1)
        } else {
          wakeUp(0)
        }
      })
    },
    fstat: function (fd, buf, wakeUp) {

    }
  }
})