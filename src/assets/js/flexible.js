// 棣栧厛鏄竴涓珛鍗虫墽琛屽嚱鏁帮紝鎵ц鏃朵紶鍏ョ殑鍙傛暟鏄痺indow鍜宒ocument
(function flexible (window, document) {
  var docEl = document.documentElement // 杩斿洖鏂囨。鐨剅oot鍏冪礌
  var dpr = window.devicePixelRatio || 1 
  // 鑾峰彇璁惧鐨刣pr锛屽嵆褰撳墠璁剧疆涓嬬墿鐞嗗儚绱犱笌铏氭嫙鍍忕礌鐨勬瘮鍊�
 
  // 璋冩暣body鏍囩鐨刦ontSize锛宖ontSize = (12 * dpr) + 'px'
  // 璁剧疆榛樿瀛椾綋澶у皬锛岄粯璁ょ殑瀛椾綋澶у皬缁ф壙鑷猙ody
  function setBodyFontSize () {
    if (document.body) {
      document.body.style.fontSize = (12 * dpr) + 'px'
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize)
    }
  }
  setBodyFontSize();
 
  // set 1rem = viewWidth / 10
  // 璁剧疆root鍏冪礌鐨刦ontSize = 鍏禼lientWidth / 10 + 鈥榩x鈥�
  function setRemUnit () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
  }
 
  setRemUnit()
 
  // 褰撻〉闈㈠睍绀烘垨閲嶆柊璁剧疆澶у皬鐨勬椂鍊欙紝瑙﹀彂閲嶆柊
  window.addEventListener('resize', setRemUnit)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      setRemUnit()
    }
  })
 
  // 妫€娴�0.5px鐨勬敮鎸侊紝鏀寔鍒檙oot鍏冪礌鐨刢lass涓湁hairlines
  if (dpr >= 2) {
    var fakeBody = document.createElement('body')
    var testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines')
    }
    docEl.removeChild(fakeBody)
  }
}(window, document))