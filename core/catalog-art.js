Arena.catalogArt={"planes": ["./assets/images/4aa4700ce78fe0a6d3cc.webp", "./assets/images/405f061ce3d5dc441ccd.webp"], "fighters": ["./assets/images/c617630c9e0e5ae6036a.webp", "./assets/images/aa939f767c3df3c8800d.webp"], "towers": ["./assets/images/b70df8c4eef20277fe94.webp"], "maze": ["./assets/images/88f641f96d90435aafdb.webp"], "race": ["./assets/images/1558df249e801c927c0b.webp"], "forest": ["./assets/images/42205f8d473109200de8.webp"], "runner": ["./assets/images/fdbd2449305c272d2214.webp"], "cyber": ["./assets/images/3b743a6ef9be511bcb95.webp", "./assets/images/c079a3de2d8bb5e61a4b.webp"]};

Arena.catalogArt.siege=["./assets/images/siege-cover.png"];

// Measured atlas rows avoid showing neighbouring illustrations at card edges.
Arena.catalogIcons=Object.fromEntries(['planes','fighters','towers','cyber','maze','race','forest','runner','siege','builder'].map((id,i)=>{const rows=[[1,293],[297,296],[597,295],[897,310],[1212,355]],row=rows[Math.floor(i/2)];return[id,{x:(i%2)*100,y:100*row[0]/(1568-row[1]),sizeY:100*1568/row[1]}]}));

Arena.catalogArt.expedition=['./assets/images/expedition-island.png'];

Arena.catalogArt.parkour=['./assets/images/parkour-garden.png'];

Arena.catalogArt.lighthouse=['./assets/images/lighthouse-coast.png'];

Arena.catalogArt.voxel=['./assets/images/voxel-world.png'];
Arena.catalogArt.alchemy=['./assets/images/alchemy-lab.png'];

Arena.catalogArt.capsule=['./assets/images/capsule-depot.png'];

Arena.catalogArt.drones=['./assets/images/drone-hangar.png'];
