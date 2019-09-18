
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
      console.log('seeking')
      wakeUp(0)
      console.log(arguments)
    },
    readv: function (fd, iovs, wakeUp) {
      let readCount = 0
      console.log("starting to read ")
      ;(function read (index) {
        console.log("iov index " + index)
        const iov = iovs[index]
        fs.read(fd, Module.HEAPU8, iov.ptr, iov.len, null, function (err, bytesRead) {
          if (err) {
            wakeUp(-1)
          } else {
            readCount += bytesRead
            if (index < iovs.length - 1) {
              read(index + 1)
            } else {
              console.log('waking up')
              wakeUp(readCount)
            }
          }
        })
      })(0)
    },
    access: function (path, amode, wakeUp) {
      console.log('inside access ' + path + ' amode ' + amode)
      fs.access(NODEJS_PATH.join(process.cwd(), path), amode, function (err) {
        if (err) {
          wakeUp(-1)
        } else {
          wakeUp(0)
        }
      })
    },
    fstat: function (fd, buf, wakeUp) {
      fs.fstat(fd, (err, stat) => {
        if (err) {
          wakeUp(-1)
          return
        }
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_dev, 'stat.dev', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.__st_dev_padding, '0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.__st_ino_truncated, 'stat.ino', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_mode, 'stat.mode', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_nlink, 'stat.nlink', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_uid, 'stat.uid', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_gid, 'stat.gid', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_rdev, 'stat.rdev', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.__st_rdev_padding, '0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_size, 'stat.size', 'i64') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_blksize, '4096', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_blocks, 'stat.blocks', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_atim.tv_sec, '(stat.atime.getTime() / 1000)|0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_atim.tv_nsec, '0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_mtim.tv_sec, '(stat.mtime.getTime() / 1000)|0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_mtim.tv_nsec, '0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_ctim.tv_sec, '(stat.ctime.getTime() / 1000)|0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_ctim.tv_nsec, '0', 'i32') }}};
        {{{ makeSetValue('buf', C_STRUCTS.stat.st_ino, 'stat.ino', 'i64') }}};
        wakeUp(0)
      })
    },
    writev: function (fd, iovs, wakeUp) {
      let writeCount = 0
      console.log("starting to write ")
      ;(function write (index) {
        console.log("iov index " + index)
        const iov = iovs[index]
        fs.write(fd, Module.HEAPU8, iov.ptr, iov.len, null, function (err, bytesRead) {
          if (err) {
            console.log(err.message)
            wakeUp(-1)
          } else {
            writeCount += bytesRead
            if (index < iovs.length - 1) {
              write(index + 1)
            } else {
              console.log('waking up')
              wakeUp(writeCount)
            }
          }
        })
      })(0)
    },
    close: function (fd, wakeUp) {
      fs.close(fd, (err) => {
        if (err) {
          wakeUp(-1)
        } else {
          wakeUp(0)
        }
      })
    }
  }
})