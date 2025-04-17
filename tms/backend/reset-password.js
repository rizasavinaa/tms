import argon2 from "argon2";


(async () => {
  const passwordBaru = 'AdminBaru123'; // password baru
  const hash = await argon2.hash(passwordBaru);
  console.log('Password baru:', passwordBaru);
  console.log('Hash:', hash);
})();
