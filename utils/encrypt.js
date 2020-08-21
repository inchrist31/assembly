const CryptoJS = require('./aes.js')
//aes加密
const encrypt = (word, k) => {
  let k1 = k;
  let zeros = 'Q0n9PzJs18Xa6Cyl';
  let ol = k1.length;
  if (ol >= 16) {
    k1 = k1.substr(-16);
  } else {
    k1 = k1 + zeros.substr(0, 16 - ol);
  }

  var key = CryptoJS.enc.Utf8.parse(k1); //16位
  var iv = CryptoJS.enc.Utf8.parse(k1);
  var encrypted = '';
  if (typeof (word) == 'string') {
    var srcs = CryptoJS.enc.Utf8.parse(word);
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
  } else if (typeof (word) == 'object') {//对象格式的转成json字符串
    data = JSON.stringify(word);
    var srcs = CryptoJS.enc.Utf8.parse(data);
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
  }
  return encrypted.ciphertext.toString();
}
// aes解密
const decrypt = (word, k) => {
  let k1 = k;
  let zeros = 'Q0n9PzJs18Xa6Cyl';
  let ol = k1.length;
  if (ol >= 16) {
    k1 = k1.substr(-16);
  } else {
    k1 = k1 + zeros.substr(0, 16 - ol);
  }
  var key = CryptoJS.enc.Utf8.parse(k1);
  var iv = CryptoJS.enc.Utf8.parse(k1);
  var encryptedHexStr = CryptoJS.enc.Hex.parse(word);

  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);

  var decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);

  return decryptedStr.toString();
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
}