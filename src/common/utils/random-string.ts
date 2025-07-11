export const randomString = (length = 60) => {
  let output = '';

  const characters =
    'SlLuU1vmlimJweMYuIvCaVpEFD0o9Zg8Er8TMBsDHfGDtMql13GR6vjEnkxsW8DFMb1NPOv6OzSyr4GaPZDRQcPwndFIDtcSEXTOcz5FC8aLW5vQ11tZxQZzQ1L7WZ0jdT2mBgAPG8o9Hn8jnxWDjrlxkOs06GUB0yxqwq0CMt0SBwVehVVSnGyoe6TH1oPsdEkkQ5WsMsPvpdBVbNUlkqd3K6uYFSG0wrsM6dcxK9NzTcwpWVokMaLiOcSQ8sOE1abATryopa69U4UACW0VeQetiQVgDBaTGRxYuYxo7Hqdcs6RnJvUDPljp7fAFZdH';

  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * characters.length);
    output += characters.substring(randomNumber, randomNumber + 1);
  }

  return output;
};

export const randomStringCaps = (length = 5) => {
  let output = '';

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};

export const randomNumbers = (length = 5) => {
  let output = '';

  const characters = '0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};
