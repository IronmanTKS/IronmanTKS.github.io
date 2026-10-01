// Load the data from the separate JSON file on the web server.
fetch('movies.json')
  .then(response => {
    if (!response.ok) throw new Error('Unable to load movies.json');
    return response.json();
  })
  .then(movies => {
    // Build the three-level menu directly from the paths in movies.json.
    const menuTree = buildMenuTree(movies);
    renderMenu(menuTree, movies);
    displayMovies(movies, 'All Movies');
  })
  .catch(error => {
    document.getElementById('movies').innerHTML =
      `<div class="error">${error.message}</div>`;
  });

function buildMenuTree(movies) {
  const root = {};
  movies.forEach(movie => {
    let branch = root;
    movie.path.forEach(category => {
      branch[category] ??= {};
      branch = branch[category];
    });
  });
  return root;
}

function renderMenu(tree, movies) {
  const menu = document.getElementById('menu');

  const all = document.createElement('li');
  all.innerHTML = '<div class="menu-row"><button class="toggle placeholder"></button><button class="filter active">All Movies</button></div>';
  all.querySelector('.filter').onclick = e => filterMovies([], movies, e.currentTarget);
  menu.appendChild(all);

  Object.entries(tree).forEach(([name, children]) => {
    menu.appendChild(makeItem(name, children, [], 1, movies));
  });
}

function makeItem(name, children, parentPath, level, movies) {
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
  filter.onclick = () => filterMovies(path, movies, filter);

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
      ul.appendChild(makeItem(childName, grandChildren, path, level + 1, movies));
    });
    li.appendChild(ul);
  }
  return li;
}

function filterMovies(path, movies, button) {
  document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
  button.classList.add('active');

  const filtered = path.length === 0
    ? movies
    : movies.filter(movie => path.every((part, i) => movie.path[i] === part));

  displayMovies(filtered, path.length ? path.join(' / ') : 'All Movies');
}

function displayMovies(items, heading) {
  document.getElementById('title').textContent = heading;
  document.getElementById('count').textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
  document.getElementById('movies').innerHTML = items.map(movie => `
    <article class="card">
      <h3>${movie.title}</h3>
      <div class="meta">${movie.year}</div>
      <div class="tags">${movie.genres.map(g => `<span class="tag">${g}</span>`).join('')}</div>
      <div class="path">${movie.path.join(' › ')}</div>
    </article>`).join('');
}
