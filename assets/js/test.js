let a = [];


for (var i = 0; i < 5; i++) {
    let buf = [];
    if (i > 0) {
        buf.push({ id: i, name: `name: ${i}` });
    }
    a.push(buf);
}

console.log(a);

a[0].push({ id: 0, name: 'name: 0' });

console.log(a);