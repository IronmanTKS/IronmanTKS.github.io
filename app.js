// Load the data from the separate JSON file on the web server.
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error('Unable to load matches.json');
    return response.json();
  })
  .then(matches => {
    const menuTree = buildMenuTree(matches);
    renderMenu(menuTree, matches);
    displayMatches(matches, 'All Matches');
  })
  .catch(error => {
    document.getElementById('matches').innerHTML =
      `<div class="error">${error.message}</div>`;
  });

function buildMenuTree(matches) {
  const root = {};
  matches.forEach(match => {
    const path = [
      match.Teams[0].Name,   // Home team
      match.Teams[1].Name    // Away team
    ];

    let branch = root;
    path.forEach(category => {
      branch[category] ??= {};
      branch = branch[category];
    });
  });
  return root;
}


function renderMenu(tree, matches) {
  const menu = document.getElementById('menu');

  const all = document.createElement('li');
  all.innerHTML = `
    <div class="menu-row">
      <button class="toggle placeholder"></button>
      <button class="filter active">All Matches</button>
    </div>`;
  all.querySelector('.filter').onclick = e => filterMatches([], matches, e.currentTarget);
  menu.appendChild(all);

  Object.entries(tree).forEach(([name, children]) => {
    menu.appendChild(makeItem(name, children, [], 1, matches));
  });
}


function makeItem(name, children, parentPath, level, matches) {
  const path = [...parentPath, name];
  const li = document.createElement('li');
  li.className = `level-${level}`;

  const row = document.createElement('div');
  row.className = 'menu-row';

  const toggle = document.createElement('button');
  toggle.className = 'toggle';

  const filter = document.createElement('button');
  filter.className = 'filter';
  filter.textContent = name;
  filter.onclick = () => filterMatches(path, matches, filter);

  const childNames = Object.keys(children);
  if (!childNames.length) {
    toggle.classList.add('placeholder');
  } else {
    toggle.onclick = () => li.classList.toggle('open');
  }

  row.append(toggle, filter);
  li.appendChild(row);

  if (childNames.length) {
    const ul = document.createElement('ul');
    Object.entries(children).forEach(([childName, grandChildren]) => {
      ul.appendChild(makeItem(childName, grandChildren, path, level + 1, matches));
    });
    li.appendChild(ul);
  }
  return li;
}


function filterMatches(path, matches, button) {
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  button.classList.add('active');

  const filtered = path.length === 0
    ? matches
    : matches.filter(match =>
        match.Teams[0].Name === path[0] &&
        (path[1] ? match.Teams[1].Name === path[1] : true)
      );

  const heading = path.length ? path.join(' / ') : 'All Matches';
  displayMatches(filtered, heading);
}


function displayMatches(items, heading) {
  document.getElementById('title').textContent = heading;
  document.getElementById('count').textContent =
    `${items.length} item${items.length === 1 ? '' : 's'}`;

  document.getElementById('matches').innerHTML = items.map(match => {
    const home = match.Teams[0];
    const away = match.Teams[1];

    return `
      <article class="card">

		<table>

		<tr>
			<td align=right ; style="padding-right:15px" ;>${home.Name}</td>
			<td align=right width=10; style="font-weight:bold">${home.FullTimeScore}</td>
			<td align=center width=15 ;>-</td>
			<td align=left; width=10; style="font-weight:bold">${away.FullTimeScore}</td>
			<td align=left; style="padding-left:15px" ;>${away.Name}</td>
		</tr>
		</table>
		</article>
      
      
    `;
  }).join('');
}


