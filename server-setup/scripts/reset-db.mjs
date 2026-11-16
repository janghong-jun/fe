// db.seed.json → db.json 으로 복사해서 연습 데이터를 처음 상태로 되돌림
import { copyFileSync } from 'node:fs';

copyFileSync('db.seed.json', 'db.json');
console.log('db.json 을 처음 상태로 되돌렸습니다.');
