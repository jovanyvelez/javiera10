/* ============================================================
   CLASE 8 — SISTEMAS OPERATIVOS (Línea de Comandos / CLI)
   Lógica de navegación, progreso, quizzes, taller y
   el simulador de consola (VirtualFS + parser + UI de terminal)
============================================================ */

/* ====== INICIO MOTOR VIRTUALFS (bloque puro, testeable sin DOM) ======
   Todo lo que está entre estos dos marcadores NO usa document/window/
   localStorage. Se puede extraer y ejecutar en Node para pruebas.
   Expone: tokenize, parseCommand, VirtualFS, Shell
============================================================ */

/* ---------- Tokenizador de línea de comandos ----------
   Respeta comillas simples y dobles, escape con '\' (solo en Bash;
   en PowerShell '\' es separador de rutas, no un escape) y separa
   redirecciones '>' y '>>' como tokens propios (incluso pegadas:
   `echo hola>notas.txt`). El contenido entre comillas se toma literal.
*/
function tokenize(line, shell) {
  const escapeActive = shell !== 'windows';   // en Windows '\' es literal (separador de ruta)
  const tokens = [];
  let cur = '';
  let quote = null;
  let escape = false;
  const flush = () => { if (cur.length) { tokens.push(cur); cur = ''; } };

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (escape) { cur += c; escape = false; continue; }
    if (quote) {
      if (c === quote) { quote = null; continue; }
      cur += c; continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '\\' && escapeActive) { escape = true; continue; }
    if (c === '>') {
      flush();
      if (line[i + 1] === '>') { tokens.push('>>'); i++; }
      else { tokens.push('>'); }
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { flush(); continue; }
    cur += c;
  }
  flush();
  return tokens;
}

/* ---------- Parser de comandos ----------
   Devuelve { cmd, args, redirect, shell, raw }.
   cmd va en minúsculas (PowerShell no distingue mayúsculas; en Bash
   ya vienen en minúsculas por convención).
   redirect = null | { op: '>'|'>>', target: string }
*/
function parseCommand(line, shell) {
  const raw = line;
  const tokens = tokenize(line, shell);
  if (tokens.length === 0) return { cmd: null, args: [], redirect: null, shell, raw };

  // separar redirección (la primera que aparezca)
  let redirect = null;
  const realTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '>' || tokens[i] === '>>') {
      redirect = { op: tokens[i], target: tokens[i + 1] || null };
      break;
    }
    realTokens.push(tokens[i]);
  }

  const cmd = realTokens[0];
  const args = realTokens.slice(1);
  // En PowerShell los comandos son case-insensitive; en Bash conviene
  // conservar lo que el usuario escribió para dar error pedagógico si usa
  // mayúsculas. Normalizamos solo para despachar en Windows.
  const canon = shell === 'windows' ? cmd.toLowerCase() : cmd;
  return { cmd, canon, args, redirect, shell, raw };
}

/* ---------- Sistema de archivos virtual (VirtualFS) ---------- */
class VirtualFS {
  constructor(shell) {
    this.shell = shell;                       // 'linux' | 'windows'
    this.sep = shell === 'windows' ? '\\' : '/';
    if (shell === 'windows') {
      this.root = 'C:\\';
      this.home = 'C:\\Users\\Estudiante';
    } else {
      this.root = '/';
      this.home = '/home/estudiante';
    }
    this.cwd = this.home;
    this.tree = this._seed();
  }

  /* árbol inicial paralelo para Linux y Windows */
  _seed() {
    const dir = (name, children = []) => ({ type: 'dir', name, children });
    const file = (name, content = '') => ({ type: 'file', name, content });
    if (this.shell === 'windows') {
      return dir('C:', [
        dir('Users', [
          dir('Estudiante', [
            dir('Documentos', [ file('tarea.txt', 'Entrega de la clase 7') ]),
            dir('Descargas', []),
            dir('Musica', [ file('playlist.m3u', '# playlist') ]),
            dir('Fotos', []),
            file('notas.txt', 'Recordatorios'),
            file('.oculto', 'soy un archivo oculto')
          ])
        ])
      ]);
    }
    return dir('/', [
      dir('home', [
        dir('estudiante', [
          dir('documentos', [ file('tarea.txt', 'Entrega de la clase 7') ]),
          dir('descargas', []),
          dir('musica', [ file('playlist.m3u', '# playlist') ]),
          dir('fotos', []),
          file('notas.txt', 'Recordatorios'),
          file('.oculto', 'soy un archivo oculto')
        ])
      ])
    ]);
  }

  /* --- conversión de rutas absolutas <-> segmentos relativos al árbol --- */
  _relSegs(abs) {
    if (this.shell === 'windows') {
      return abs.replace(/^C:\\/i, '').split('\\').filter(Boolean);
    }
    return abs.split('/').filter(Boolean);
  }

  /* --- normaliza una ruta (absoluta o relativa) a absoluta; null si inválida --- */
  normalize(arg) {
    if (!arg || arg === '') return this.cwd;
    let s = arg;
    let isAbs = false;

    if (this.shell === 'windows') {
      const m = s.match(/^([A-Za-z]):[\\/]?/);
      if (m) {
        if (m[1].toUpperCase() !== 'C') return null;   // unidad no disponible
        isAbs = true;
        s = s.slice(m[0].length);
      } else if (/^[\\/]/.test(s)) {
        isAbs = true; s = s.replace(/^[\\/]+/, '');
      }
    } else {
      isAbs = s.startsWith('/');
      if (isAbs) s = s.replace(/^\/+/, '');
    }

    // segmentos base
    let segs;
    if (isAbs) segs = [];
    else segs = this.cwd.split(this.sep).filter(Boolean);

    const splitter = this.shell === 'windows' ? /[\\/]/ : '/';
    for (const part of s.split(splitter)) {
      if (part === '' || part === '.') continue;
      if (part === '..') { segs.pop(); continue; }   // clamp en la raíz
      segs.push(part);
    }

    if (this.shell === 'windows') {
      if (segs.length === 0 || !/^[A-Za-z]:$/.test(segs[0])) segs.unshift('C:');
      return 'C:\\' + segs.slice(1).join('\\');
    }
    return '/' + segs.join('/');
  }

  /* --- navegación del árbol --- */
  _nodeAt(abs) {
    const segs = this._relSegs(abs);
    let cur = this.tree;
    for (const seg of segs) {
      if (!cur || cur.type !== 'dir') return null;
      const child = cur.children.find(c => c.name === seg);
      if (!child) return null;
      cur = child;
    }
    return cur;
  }

  _parentAndName(abs) {
    const segs = this._relSegs(abs);
    if (segs.length === 0) return null;
    let cur = this.tree;
    for (let i = 0; i < segs.length - 1; i++) {
      if (!cur || cur.type !== 'dir') return null;
      const child = cur.children.find(c => c.name === segs[i]);
      if (!child) return null;
      cur = child;
    }
    if (!cur || cur.type !== 'dir') return null;
    return { parent: cur, name: segs[segs.length - 1] };
  }

  exists(abs) { return !!this._nodeAt(abs); }
  isDir(abs) { const n = this._nodeAt(abs); return !!n && n.type === 'dir'; }
  isFile(abs) { const n = this._nodeAt(abs); return !!n && n.type === 'file'; }

  /* resuelve un argumento del usuario a ruta absoluta */
  resolve(arg) { return this.normalize(arg); }

  /* entradas de un directorio (para listado y autocompletado) */
  entries(abs) {
    const n = this._nodeAt(abs);
    if (!n || n.type !== 'dir') return [];
    return n.children.map(c => ({ name: c.name, type: c.type, hidden: c.name.startsWith('.') }));
  }

  /* operaciones de mutación: devuelven { ok:true } | { ok:false, msg } */
  makeDir(abs) {
    const p = this._parentAndName(abs);
    if (!p) return { ok: false, msg: `no se puede crear '${this._short(abs)}': la ruta padre no existe` };
    if (p.parent.children.some(c => c.name === p.name))
      return { ok: false, msg: `no se puede crear '${p.name}': ya existe` };
    p.parent.children.push({ type: 'dir', name: p.name, children: [] });
    return { ok: true };
  }

  makeFile(abs) {
    const p = this._parentAndName(abs);
    if (!p) return { ok: false, msg: `no se puede crear '${this._short(abs)}': la ruta padre no existe` };
    const existing = p.parent.children.find(c => c.name === p.name);
    if (existing) {
      if (existing.type === 'dir') return { ok: false, msg: `'${p.name}' ya existe y es un directorio` };
      return { ok: true };   // touch sobre archivo existente: ok
    }
    p.parent.children.push({ type: 'file', name: p.name, content: '' });
    return { ok: true };
  }

  writeFile(abs, content, append) {
    const p = this._parentAndName(abs);
    if (!p) return { ok: false, msg: `no se puede escribir '${this._short(abs)}': la ruta padre no existe` };
    let f = p.parent.children.find(c => c.name === p.name);
    if (f && f.type === 'dir') return { ok: false, msg: `'${p.name}' es un directorio` };
    if (!f) {
      f = { type: 'file', name: p.name, content: '' };
      p.parent.children.push(f);
    }
    f.content = append ? (f.content ? f.content + '\n' + content : content) : content;
    return { ok: true };
  }

  readFile(abs) {
    const n = this._nodeAt(abs);
    if (!n) return { ok: false, msg: `no existe '${this._short(abs)}'` };
    if (n.type === 'dir') return { ok: false, msg: `'${this._short(abs)}' es un directorio` };
    return { ok: true, content: n.content || '' };
  }

  remove(abs, recursive) {
    const n = this._nodeAt(abs);
    if (!n) return { ok: false, msg: `no existe '${this._short(abs)}'` };
    if (n.type === 'dir' && !recursive && n.children.length > 0)
      return { ok: false, msg: `'${this._short(abs)}' no está vacío (usa -r / -Recurse)` };
    const p = this._parentAndName(abs);
    if (!p) return { ok: false, msg: `no se puede borrar '${this._short(abs)}'` };
    p.parent.children = p.parent.children.filter(c => c.name !== p.name);
    return { ok: true };
  }

  copy(srcAbs, dstAbs) {
    const n = this._nodeAt(srcAbs);
    if (!n) return { ok: false, msg: `no existe '${this._short(srcAbs)}'` };
    if (n.type === 'dir') return { ok: false, msg: `cp de un directorio requiere -r (no soportado en el simulador)` };
    const w = this.writeFile(dstAbs, n.content, false);
    return w;
  }

  /* ruta relativa al home para mensajes legibles */
  _short(abs) {
    if (abs === this.home) return this.shell === 'windows' ? '~' : '~';
    if (abs.startsWith(this.home + this.sep)) {
      return '~' + this.sep + abs.slice(this.home.length + 1);
    }
    return abs;
  }

  /* serialización para persistencia */
  toJSON() { return { shell: this.shell, cwd: this.cwd, tree: this.tree }; }
  static fromJSON(data) {
    const fs = new VirtualFS(data.shell);
    fs.cwd = data.cwd || fs.home;
    fs.tree = data.tree || fs._seed();
    return fs;
  }
}

/* ---------- Shell: ejecuta comandos sobre un VirtualFS ---------- */
class Shell {
  constructor(shellOrFs) {
    // Acepta un nombre de shell ('linux'|'windows') para sembrar un FS nuevo,
    // o una instancia existente de VirtualFS (para restaurar desde localStorage).
    this.fs = (shellOrFs instanceof VirtualFS) ? shellOrFs : new VirtualFS(shellOrFs);
    this.history = [];
  }

  /* conjuntos de comandos por shell (para help y autocompletado) */
  static COMMANDS = {
    linux: ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'rm', 'rmdir', 'cp', 'mv', 'clear', 'help', 'whoami'],
    windows: ['pwd', 'Get-Location', 'ls', 'Get-ChildItem', 'dir', 'gci', 'cd', 'Set-Location',
              'mkdir', 'New-Item', 'ni', 'touch', 'type', 'Get-Content', 'cat', 'gc',
              'echo', 'Write-Output', 'del', 'Remove-Item', 'ri', 'rm', 'rmdir', 'rd',
              'cls', 'Clear-Host', 'clear', 'help', 'whoami']
  };

  commandNames() { return Shell.COMMANDS[this.fs.shell]; }

  /* alias de PowerShell -> nombre canónico de acción */
  static PS_ALIAS = {
    'pwd': 'pwd', 'get-location': 'pwd',
    'ls': 'lswin', 'get-childitem': 'lswin', 'dir': 'lswin', 'gci': 'lswin',
    'cd': 'cd', 'set-location': 'cd', 'sl': 'cd',
    'mkdir': 'mkdir', 'new-item': 'newitem', 'ni': 'newitem',
    'touch': 'touch', 'type': 'cat', 'get-content': 'cat', 'cat': 'cat', 'gc': 'cat',
    'echo': 'echo', 'write-output': 'echo', 'write': 'echo',
    'del': 'rm', 'remove-item': 'rm', 'ri': 'rm', 'rm': 'rm', 'rmdir': 'rmdir', 'rd': 'rmdir',
    'cls': 'clear', 'clear-host': 'clear', 'clear': 'clear',
    'help': 'help', '?': 'help', 'whoami': 'whoami'
  };

  /* prompt visible según shell */
  prompt() {
    if (this.fs.shell === 'windows') {
      // PowerShell muestra la ruta completa (sin ~), igual que la consola real
      return `PS ${this.fs.cwd}>`;
    }
    let p = this.fs.cwd;
    if (p === this.fs.home) p = '~';
    else if (p.startsWith(this.fs.home + '/')) p = '~' + p.slice(this.fs.home.length);
    return `estudiante@javiera10:${p}$`;
  }

  /* ejecuta una línea; devuelve { lines:[], cleared:false } */
  exec(line) {
    const parsed = parseCommand(line, this.fs.shell);
    if (parsed.cmd === null) return { lines: [], cleared: false };
    if (parsed.redirect && !parsed.redirect.target)
      return { lines: [`error de sintaxis cerca de '>' (falta el archivo destino)`], cleared: false };

    const res = this._dispatch(parsed);

    // redirección: volcar salida al archivo en vez de pantalla
    if (parsed.redirect && res.lines.length) {
      const target = this.fs.normalize(parsed.redirect.target);
      if (!target) return { lines: [`ruta no válida: '${parsed.redirect.target}'`], cleared: false };
      const w = this.fs.writeFile(target, res.lines.join('\n'), parsed.redirect.op === '>>');
      if (!w.ok) return { lines: [w.msg], cleared: false };
      return { lines: [], cleared: false };
    }
    return res;
  }

  _dispatch(parsed) {
    const { canon, args, shell } = parsed;
    let cmdKey = canon;
    if (shell === 'windows') cmdKey = Shell.PS_ALIAS[canon] || null;
    else cmdKey = ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'rm', 'rmdir', 'cp', 'mv', 'clear', 'help', 'whoami'].includes(canon) ? canon : null;

    if (!cmdKey) return { lines: [this._unknown(parsed.cmd)], cleared: false };

    switch (cmdKey) {
      case 'pwd': return { lines: [this.fs.cwd], cleared: false };
      case 'whoami': return { lines: ['estudiante'], cleared: false };
      case 'clear': return { lines: [], cleared: true };
      case 'help': return { lines: this._help(), cleared: false };
      case 'cd': return { lines: this._cd(args), cleared: false };
      case 'ls': return { lines: this._lsLinux(args), cleared: false };
      case 'lswin': return { lines: this._lsWin(parsed), cleared: false };
      case 'mkdir': return { lines: this._mkdir(args), cleared: false };
      case 'newitem': return { lines: this._newItem(args), cleared: false };
      case 'touch': return { lines: this._touch(args, shell), cleared: false };
      case 'cat': return { lines: this._cat(args), cleared: false };
      case 'echo': return { lines: this._echo(args), cleared: false };
      case 'rm': return { lines: this._rm(args, shell), cleared: false };
      case 'rmdir': return { lines: this._rmdir(args, shell), cleared: false };
      case 'cp': return { lines: this._cp(args), cleared: false };
      case 'mv': return { lines: this._mv(args), cleared: false };
      default: return { lines: [this._unknown(parsed.cmd)], cleared: false };
    }
  }

  _unknown(cmd) {
    const known = this.commandNames();
    let suggestion = null, best = 3;
    for (const k of known) {
      const d = _levenshtein(cmd.toLowerCase(), k.toLowerCase());
      if (d < best) { best = d; suggestion = k; }
    }
    const tip = suggestion ? ` ¿Quisiste decir '${suggestion}'?` : '';
    return `comando no reconocido: '${cmd}'.${tip} Escribe 'help' para ver los disponibles.`;
  }

  _cd(args) {
    if (args.length === 0) { this.fs.cwd = this.fs.home; return []; }
    const abs = this.fs.normalize(args[0]);
    if (!abs) return [`cd: unidad no válida en '${args[0]}' (solo existe C:)`];
    const n = this.fs._nodeAt(abs);
    if (!n) return [`cd: no existe el directorio '${this.fs._short(abs)}'`];
    if (n.type !== 'dir') return [`cd: '${this.fs._short(abs)}' no es un directorio`];
    this.fs.cwd = abs;
    return [];
  }

  _flags(args) {
    const flags = args.filter(a => a.startsWith('-'));
    const positional = args.filter(a => !a.startsWith('-'));
    return { flags, positional };
  }

  _lsLinux(args) {
    const { flags, positional } = this._flags(args);
    const longFmt = flags.some(f => f.includes('l'));
    const showAll = flags.some(f => f.includes('a'));
    const target = positional[0] ? this.fs.normalize(positional[0]) : this.fs.cwd;
    if (!target) return [`ls: unidad no válida en '${positional[0]}'`];
    const node = this.fs._nodeAt(target);
    if (!node) return [`ls: no se puede acceder a '${positional[0]}': no existe`];
    if (node.type === 'file') return [positional[0]];
    let entries = this.fs.entries(target);
    if (!showAll) entries = entries.filter(e => !e.hidden);
    if (entries.length === 0) return [];
    if (!longFmt) return entries.map(e => e.name + (e.type === 'dir' ? '/' : ''));
    return entries.map(e => {
      const t = e.type === 'dir' ? 'd' : '-';
      return `${t}rw-r--r--  ${e.name}${e.type === 'dir' ? '/' : ''}`;
    });
  }

  _lsWin(parsed) {
    const { flags, positional } = this._flags(parsed.args);
    // ¿el usuario intentó banderas estilo Bash con 'ls' (alias)?
    const bashFlags = flags.some(f => /[la]/.test(f));
    const tip = (parsed.canon === 'ls' && bashFlags)
      ? [`💡 En PowerShell 'ls' es un alias de Get-ChildItem y no acepta '-l'/'-a'.`,
         `   Usa 'dir' o 'Get-ChildItem'. Para ver ocultos: 'dir -Force'.`,
         `   (En Bash Linux sí funciona 'ls -la'.)`]
      : [];
    const showAll = flags.some(f => /Force/i.test(f)) || (parsed.canon === 'ls' && bashFlags);
    const target = positional[0] ? this.fs.normalize(positional[0]) : this.fs.cwd;
    if (!target) return [...tip, `dir: unidad no válida en '${positional[0]}'`];
    const node = this.fs._nodeAt(target);
    if (!node) return [...tip, `No se encuentra la ruta '${positional[0]}' porque no existe.`];
    if (node.type === 'file') return [...tip, positional[0]];
    let entries = this.fs.entries(target);
    if (!showAll) entries = entries.filter(e => !e.hidden);
    if (entries.length === 0) return tip;
    const lines = entries.map(e => {
      const t = e.type === 'dir' ? 'd----' : '-a---';
      return `${t}   ${e.name}${e.type === 'dir' ? '\\' : ''}`;
    });
    return [...tip, ...lines];
  }

  _mkdir(args) {
    if (args.length === 0) return [`mkdir: falta el nombre de la carpeta`];
    const out = [];
    for (const a of args) {
      const abs = this.fs.normalize(a);
      if (!abs) { out.push(`mkdir: ruta no válida '${a}'`); continue; }
      const r = this.fs.makeDir(abs);
      if (!r.ok) out.push(`mkdir: ${r.msg}`);
    }
    return out;
  }

  _newItem(args) {
    // Formatos: New-Item -ItemType Directory -Name X | -ItemType File X | ni -ItemType File X
    let itemType = null, name = null;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (/^-ItemType$/i.test(a)) { itemType = args[i + 1]; i++; }
      else if (/^-Name$/i.test(a) || /^-Path$/i.test(a)) { name = args[i + 1]; i++; }
      else if (!name && !a.startsWith('-')) { name = a; }   // primer posicional = nombre
    }
    if (!itemType) itemType = name && /\./.test(name) ? 'File' : 'Directory';
    const abs = name ? this.fs.normalize(name) : null;
    if (!abs) return [`New-Item: falta el nombre (-Name) del elemento`];
    if (/dir/i.test(itemType)) {
      const r = this.fs.makeDir(abs);
      return r.ok ? [] : [`New-Item: ${r.msg}`];
    }
    const r = this.fs.makeFile(abs);
    return r.ok ? [] : [`New-Item: ${r.msg}`];
  }

  _touch(args, shell) {
    if (args.length === 0) return [`touch: falta el nombre del archivo`];
    if (shell === 'windows') {
      // PowerShell no trae 'touch': enseñar y aún así crear
      return [`💡 PowerShell no tiene 'touch'. Usa: New-Item -ItemType File <nombre>`, ...this._createFiles(args)];
    }
    return this._createFiles(args);
  }

  _createFiles(args) {
    const out = [];
    for (const a of args) {
      const abs = this.fs.normalize(a);
      if (!abs) { out.push(`touch: ruta no válida '${a}'`); continue; }
      const r = this.fs.makeFile(abs);
      if (!r.ok) out.push(`touch: ${r.msg}`);
    }
    return out;
  }

  _cat(args) {
    if (args.length === 0) return [`cat: falta el nombre del archivo`];
    const out = [];
    for (const a of args) {
      const abs = this.fs.normalize(a);
      if (!abs) { out.push(`cat: ruta no válida '${a}'`); continue; }
      const r = this.fs.readFile(abs);
      if (!r.ok) out.push(`cat: ${r.msg}`);
      else if (r.content) out.push(...r.content.split('\n'));
    }
    return out;
  }

  _echo(args) {
    // sin redirección (la redirección se gestiona en exec): imprime el texto
    return [args.join(' ')];
  }

  _rm(args, shell) {
    const { flags, positional } = this._flags(args);
    const recursive = flags.some(f => /r/i.test(f) && shell === 'linux') ||
                      flags.some(f => /Recurse/i.test(f)) ||
                      flags.some(f => /^-[rf]+$/.test(f));
    if (positional.length === 0) return [`rm: falta el nombre de lo que quieres borrar`];
    const out = [];
    for (const a of positional) {
      const abs = this.fs.normalize(a);
      if (!abs) { out.push(`rm: ruta no válida '${a}'`); continue; }
      const r = this.fs.remove(abs, recursive);
      if (!r.ok) out.push(`rm: ${r.msg}`);
    }
    return out;
  }

  _rmdir(args, shell) {
    if (args.length === 0) return [`rmdir: falta el nombre de la carpeta`];
    const out = [];
    for (const a of args.filter(x => !x.startsWith('-'))) {
      const abs = this.fs.normalize(a);
      if (!abs) { out.push(`rmdir: ruta no válida '${a}'`); continue; }
      const r = this.fs.remove(abs, false);
      if (!r.ok) out.push(`rmdir: ${r.msg}`);
    }
    return out;
  }

  _cp(args) {
    if (args.length < 2) return [`cp: uso: cp <origen> <destino>`];
    const src = this.fs.normalize(args[0]);
    const dst = this.fs.normalize(args[1]);
    const r = this.fs.copy(src, dst);
    return r.ok ? [] : [`cp: ${r.msg}`];
  }

  _mv(args) {
    if (args.length < 2) return [`mv: uso: mv <origen> <destino>`];
    const src = this.fs.normalize(args[0]);
    const dst = this.fs.normalize(args[1]);
    const n = this.fs._nodeAt(src);
    if (!n) return [`mv: no existe '${args[0]}'`];
    const c = this.fs.copy(src, dst);
    if (!c.ok) return [`mv: ${c.msg}`];
    this.fs.remove(src, true);
    return [];
  }

  _help() {
    if (this.fs.shell === 'linux') {
      return [
        'Comandos disponibles (Bash / Linux):',
        '  pwd              mostrar la carpeta actual',
        '  ls [-l] [-a]     listar archivos (-l largo, -a ocultos)',
        '  cd [ruta]        cambiar de carpeta (sin arg: volver a ~)',
        '  mkdir <nombre>   crear carpeta',
        '  touch <nombre>   crear archivo vacío',
        '  cat <archivo>    mostrar contenido',
        '  echo <texto>     imprimir texto (usa > o >> para guardar)',
        '  rm [-r] <nombre> borrar (-r para carpetas)',
        '  rmdir <nombre>   borrar carpeta vacía',
        '  cp <o> <d>       copiar archivo',
        '  mv <o> <d>       mover/renombrar',
        '  clear            limpiar pantalla',
        '  whoami           mostrar usuario',
        '  help             esta ayuda'
      ];
    }
    return [
      'Comandos disponibles (PowerShell / Windows):',
      '  pwd / Get-Location            mostrar la carpeta actual',
      '  dir / ls / Get-ChildItem      listar archivos (-Force: ocultos)',
      '  cd / Set-Location [ruta]      cambiar de carpeta',
      '  mkdir <nombre>               crear carpeta',
      '  New-Item -ItemType File <n>  crear archivo (alias: ni)',
      '  type / Get-Content <archivo>  mostrar contenido',
      '  echo <texto>                  imprimir (usa > o >> para guardar)',
      '  del / Remove-Item [-Recurse]  borrar',
      '  rmdir <nombre>                borrar carpeta vacía',
      '  cls / Clear-Host              limpiar pantalla',
      '  whoami                        mostrar usuario',
      '  help                          esta ayuda'
    ];
  }
}

/* distancia de Levenshtein (para sugerir comandos cercanos) */
function _levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let cur = [i];
    for (let j = 1; j <= n; j++) {
      cur.push(a[i - 1] === b[j - 1] ? prev[j - 1]
        : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]));
    }
    prev = cur;
  }
  return prev[n];
}

/* ====== FIN MOTOR VIRTUALFS ====== */


/* ============================================================
   A PARTIR DE AQUÍ: UI / DOM (navegación, progreso, terminal)
============================================================ */

const TOTAL_MODULOS = 7; // 0..6 (incluye módulo de descanso)

/* ---------- ESTADO GLOBAL ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  talleres: {},
  retos: new Set(),       // índices de retos completados
  badges: new Set(),
  xp: 0
};

const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 25;
const XP_POR_RETO = 25;
const XP_POR_CHECK = 10;
const XP_POR_TRIVIA = 15;
// Máximo alcanzable: 5×30 (módulos) + 5×25 (quizzes) + 5×25 (retos)
// + 6×10 (taller) + 15 (trivia) = 475
const XP_TOTAL = 475;

/* ---------- TERMINAL: shells por pestaña ---------- */
let term = {
  activa: 'bash',                         // 'bash' | 'powershell'
  shells: { bash: null, powershell: null },
  history: { bash: [], powershell: [] },
  histIndex: { bash: -1, powershell: -1 }
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarTrivia();
  configurarTaller();
  configurarTerminal();
  configurarTeclado();
  actualizarUI();
  validarRetos(true);
});

/* ---------- PERSISTENCIA ---------- */
const STORAGE_KEY = 'curso-so-interfaz-linea-comandos-cli';

function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      talleres: estado.talleres,
      retos: [...estado.retos],
      badges: [...estado.badges],
      xp: estado.xp,
      termActiva: term.activa,
      fs: {
        bash: term.shells.bash ? term.shells.bash.fs.toJSON() : null,
        powershell: term.shells.powershell ? term.shells.powershell.fs.toJSON() : null
      },
      history: term.history
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch (e) { /* sin localStorage: ignorar */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
    estado.talleres = datos.talleres || {};
    estado.retos = new Set(datos.retos || []);
    estado.badges = new Set(datos.badges || []);
    estado.xp = datos.xp || 0;
    term.activa = datos.termActiva || 'bash';
    if (datos.history) term.history = datos.history;
    // restaurar FS si existe; si no, quedan los recién sembrados
    if (datos.fs) {
      if (datos.fs.bash) term.shells.bash = new Shell(VirtualFS.fromJSON(datos.fs.bash));
      if (datos.fs.powershell) term.shells.powershell = new Shell(VirtualFS.fromJSON(datos.fs.powershell));
    }
  } catch (e) { /* datos corruptos: ignorar */ }
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => irAModulo(parseInt(btn.dataset.modulo, 10)));
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) marcarCompletado(estado.moduloActual);
      irAModulo(m);
    });
  });
  document.querySelectorAll('[data-reiniciar]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) irAModulo(0);
    });
  });
}

function irAModulo(n) {
  if (n < 0 || n >= TOTAL_MODULOS) return;
  estado.moduloActual = n;
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  const mod = document.querySelector(`.modulo[data-modulo="${n}"]`);
  if (mod) mod.classList.add('activo');
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.classList.toggle('activo', parseInt(btn.dataset.modulo, 10) === n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  actualizarUI();
  guardarProgreso();
}

/* ---------- COMPLETADOS, XP Y BADGES ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);

  const badgesModulo = {
    0: '🚀 Iniciado',
    1: '💻 CLI Aware',
    2: '🧭 Navegante',
    3: '📂 Creador',
    4: '☕ Descansado',
    5: '🎯 Retador',
    6: '🛠️ Shell Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);
  if (estado.completados.size === TOTAL_MODULOS) otorgarBadge('🏆 Consola Dominada');

  mostrarToast(`🎉 ¡+${XP_POR_MODULO} XP! Módulo ${n} completado`);
  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎖️ Insignia: ${nombre}`);
  actualizarUI();
}

function addXP(cantidad) {
  estado.xp = Math.min(XP_TOTAL, estado.xp + cantidad);
  guardarProgreso();
  actualizarUI();
}

/* ---------- UI: PROGRESO Y BADGES ---------- */
function actualizarUI() {
  const completables = [1, 2, 3, 5, 6];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';
  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', '¿Qué es la CLI?', 'Navegación', 'Crear y borrar', 'Descanso', 'Retos CLI', 'Taller'];
    mAct.textContent = labels[estado.moduloActual] || ('Módulo ' + estado.moduloActual);
  }

  const xpEl = document.getElementById('xp-display');
  if (xpEl) xpEl.textContent = `${estado.xp} / ${XP_TOTAL} XP`;

  const badgesCont = document.getElementById('badges');
  if (badgesCont) {
    badgesCont.innerHTML = '';
    estado.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = b;
      badgesCont.appendChild(span);
    });
  }

  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
  });
}

/* ---------- QUIZZES ---------- */
function configurarQuizzes() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const idQuiz = quiz.dataset.quiz;
    const preguntas = quiz.querySelectorAll('.pregunta');

    preguntas.forEach(pregunta => {
      const correcta = pregunta.dataset.correcta;
      const opciones = pregunta.querySelectorAll('.opcion');

      opciones.forEach(op => {
        op.addEventListener('click', () => {
          if (pregunta.dataset.respondida === 'true') return;
          pregunta.dataset.respondida = 'true';
          const elegida = op.dataset.op;
          if (elegida === correcta) {
            op.classList.add('correcta');
            pregunta.dataset.acierto = 'true';
          } else {
            op.classList.add('incorrecta');
            pregunta.dataset.acierto = 'false';
            opciones.forEach(o => { if (o.dataset.op === correcta) o.classList.add('correcta'); });
          }
          opciones.forEach(o => o.disabled = true);
          verificarQuizCompleto(quiz, idQuiz);
        });
      });
    });
  });
}

function verificarQuizCompleto(quiz, idQuiz) {
  const preguntas = quiz.querySelectorAll('.pregunta');
  const respondidas = quiz.querySelectorAll('.pregunta[data-respondida="true"]');
  if (preguntas.length !== respondidas.length) return;

  let aciertos = 0;
  preguntas.forEach(p => { if (p.dataset.acierto === 'true') aciertos++; });
  const total = preguntas.length;

  const yaRecompensado = estado.quizzes[idQuiz] && estado.quizzes[idQuiz].recompensado;
  estado.quizzes[idQuiz] = { aciertos, total, recompensado: !!yaRecompensado };

  if (aciertos === total && !yaRecompensado) {
    estado.quizzes[idQuiz].recompensado = true;
    addXP(XP_POR_QUIZ_PERFECTO);
    mostrarToast(`🎉 ¡Quiz perfecto! +${XP_POR_QUIZ_PERFECTO} XP`);
  }

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.innerHTML = yaRecompensado
        ? `🎉 ¡Perfecto! ${aciertos}/${total}.`
        : `🎉 ¡Perfecto! ${aciertos}/${total}. (+${XP_POR_QUIZ_PERFECTO} XP)`;
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento!`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo.`;
    }
  }
  guardarProgreso();
}

/* ---------- TRIVIA (descanso) ---------- */
function configurarTrivia() {
  const opts = document.querySelectorAll('#triviaOpts .trivia-opt');
  const result = document.getElementById('triviaResult');
  if (!opts.length || !result) return;
  const correcta = document.querySelector('#triviaOpts').dataset.tcorrecta;
  let hecha = false;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      if (hecha) return;
      hecha = true;
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! `cat`/`Get-Content` lee archivos, no lista. ¡Volvamos a la consola!';
        addXP(XP_POR_TRIVIA);
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244,63,94,.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. `cat`/`Get-Content` lee el contenido de un archivo; `dir`/`Get-ChildItem` (alias `ls`, `gci`) es el que lista.';
      }
      guardarProgreso();
    });
  });
}

/* ---------- TALLER (checks) ---------- */
function configurarTaller() {
  document.querySelectorAll('#tallerChecks input[type="checkbox"]').forEach(chk => {
    const id = chk.dataset.check;
    if (estado.talleres[id]) chk.checked = true;
    chk.addEventListener('change', () => {
      const estaba = !!estado.talleres[id];
      estado.talleres[id] = chk.checked;
      if (chk.checked && !estaba) {
        addXP(XP_POR_CHECK);
        mostrarToast(`✅ +${XP_POR_CHECK} XP`);
      }
      guardarProgreso();
    });
  });
}

/* ---------- TERMINAL ---------- */
function configurarTerminal() {
  // instanciar shells si no se restauraron desde localStorage
  if (!term.shells.bash) term.shells.bash = new Shell('linux');
  if (!term.shells.powershell) term.shells.powershell = new Shell('windows');

  const pantalla = document.getElementById('termPantalla');
  const input = document.getElementById('termInput');
  const promptEl = document.getElementById('tePrompt');

  // pestañas
  document.querySelectorAll('.tab-term').forEach(tab => {
    tab.addEventListener('click', () => {
      const sh = tab.dataset.shell;
      term.activa = (sh === 'powershell') ? 'powershell' : 'bash';
      document.querySelectorAll('.tab-term').forEach(t => t.classList.toggle('activo', t === tab));
      refrescarPrompt();
      input.focus();
      guardarProgreso();
      validarRetos(true);
    });
  });

  // botón reiniciar FS
  const btnReset = document.getElementById('btnReiniciarFS');
  if (btnReset) btnReset.addEventListener('click', () => {
    if (!confirm('¿Reiniciar el sistema de archivos del simulador? Se borrarán los cambios de la consola (no tu progreso de la clase).')) return;
    term.shells.bash = new Shell('linux');
    term.shells.powershell = new Shell('windows');
    term.history.bash = []; term.history.powershell = [];
    term.histIndex.bash = -1; term.histIndex.powershell = -1;
    estado.retos = new Set();
    pintarRetos();
    pantalla.innerHTML = '';
    imprimirBienvenida();
    refrescarPrompt();
    guardarProgreso();
    input.focus();
  });

  if (input) {
    input.addEventListener('keydown', (e) => manejarTeclaTerm(e));
  }

  imprimirBienvenida();
  refrescarPrompt();

  // diagnóstico de retos: al tocar un reto (pendiente o no) se muestra una
  // pista contextual según el estado actual del sistema de archivos.
  document.querySelectorAll('#retosPanel .reto').forEach((el, i) => {
    if (el.dataset.diagBound) return;
    el.dataset.diagBound = '1';
    el.style.cursor = 'pointer';
    el.title = 'Toca para ver una pista de diagnóstico';
    el.addEventListener('click', () => mostrarToast('💡 ' + diagnosticReto(i)));
  });
}

function shellActiva() {
  return term.activa === 'powershell' ? term.shells.powershell : term.shells.bash;
}

function refrescarPrompt() {
  const promptEl = document.getElementById('tePrompt');
  if (!promptEl) return;
  const sh = shellActiva();
  promptEl.textContent = sh.prompt();
  promptEl.classList.toggle('ps', term.activa === 'powershell');
}

function imprimirBienvenida() {
  const sh = shellActiva();
  imprimirLineas([
    `Simulador de consola · ${term.activa === 'powershell' ? 'PowerShell (Windows)' : 'Bash (Linux)'}`,
    `Escribe 'help' para ver los comandos. Usa Tab para autocompletar y ↑/↓ para el historial.`,
    ''
  ]);
}

function imprimirLineas(lineas, tipo = 'out') {
  const pantalla = document.getElementById('termPantalla');
  if (!pantalla) return;
  for (const l of lineas) {
    const div = document.createElement('div');
    div.className = 'tp-linea ' + (tipo === 'err' ? 'tp-err' : 'tp-out');
    div.textContent = l;
    pantalla.appendChild(div);
  }
  pantalla.scrollTop = pantalla.scrollHeight;
}

function imprimirBloquePrompt(cmd, out) {
  const pantalla = document.getElementById('termPantalla');
  if (!pantalla) return;
  const sh = shellActiva();
  // línea de prompt + comando
  const linea = document.createElement('div');
  linea.className = 'tp-linea';
  const sp = document.createElement('span');
  sp.className = 'tp-prompt' + (term.activa === 'powershell' ? ' ps' : '');
  sp.textContent = sh.prompt() + ' ';
  const cm = document.createElement('span');
  cm.className = 'tp-cmd';
  cm.textContent = cmd;
  linea.appendChild(sp); linea.appendChild(cm);
  pantalla.appendChild(linea);
  // salida
  imprimirLineas(out, out.length && out[0] && /error|no existe|no se puede|no reconocido|💡|❌/i.test(out[0]) ? 'err' : 'out');
}

function manejarTeclaTerm(e) {
  const input = document.getElementById('termInput');
  const key = e.key;

  if (key === 'Enter') {
    e.preventDefault();
    const raw = input.value;
    input.value = '';
    ejecutarComando(raw);
  } else if (key === 'Tab') {
    e.preventDefault();
    const res = autocompletar(input.value);
    if (res.completed !== input.value) {
      input.value = res.completed;
    } else if (res.suggestions.length) {
      imprimirLineas(res.suggestions, 'out');
      imprimirLineas([shellActiva().prompt() + ' ' + input.value], 'out');
    }
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    const h = term.history[term.activa];
    if (!h.length) return;
    if (term.histIndex[term.activa] === -1) term.histIndex[term.activa] = h.length - 1;
    else if (term.histIndex[term.activa] > 0) term.histIndex[term.activa]--;
    input.value = h[term.histIndex[term.activa]] || '';
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    const h = term.history[term.activa];
    if (term.histIndex[term.activa] === -1) return;
    if (term.histIndex[term.activa] < h.length - 1) {
      term.histIndex[term.activa]++;
      input.value = h[term.histIndex[term.activa]] || '';
    } else {
      term.histIndex[term.activa] = -1;
      input.value = '';
    }
  } else if (key === 'l' && e.ctrlKey) {
    e.preventDefault();
    document.getElementById('termPantalla').innerHTML = '';
  }
}

function ejecutarComando(raw) {
  const sh = shellActiva();
  const cmd = raw.trim();
  imprimirBloquePrompt(raw, []);
  if (cmd === '') { return; }
  // historial
  const h = term.history[term.activa];
  if (h[h.length - 1] !== cmd) h.push(cmd);
  term.histIndex[term.activa] = -1;

  const res = sh.exec(raw);
  if (res.cleared) {
    document.getElementById('termPantalla').innerHTML = '';
  } else if (res.lines.length) {
    imprimirLineas(res.lines);
  }
  // un cd pudo cambiar el directorio actual: refrescar el prompt del input
  refrescarPrompt();
  guardarProgreso();
  validarRetos();
}

/* ---------- AUTOCOMPLETADO (Tab) ---------- */
function autocompletar(value) {
  const sh = shellActiva();
  const sinPrefijo = !value.includes(' ');
  // 1) autocompletar comando
  if (sinPrefijo) {
    const names = sh.commandNames();
    const matches = names.filter(n => n.toLowerCase().startsWith(value.toLowerCase()));
    if (matches.length === 1) return { completed: matches[0] + ' ', suggestions: [] };
    if (matches.length > 1) {
      const pref = prefijoComun(matches);
      return { completed: pref, suggestions: matches };
    }
    return { completed: value, suggestions: [] };
  }
  // 2) autocompletar última ruta
  const partes = value.split(/(\s+)/);   // conserva espacios
  const last = partes[partes.length - 1];
  const sep = sh.fs.sep;
  // dividir en dir + partial
  const idx = Math.max(last.lastIndexOf(sep), last.lastIndexOf('/'));
  let dirPart = idx >= 0 ? last.slice(0, idx) : '';
  let partial = idx >= 0 ? last.slice(idx + 1) : last;
  const dirAbs = sh.fs.normalize(dirPart || '.');
  if (!dirAbs) return { completed: value, suggestions: [] };
  const entries = sh.fs.entries(dirAbs);
  const matches = entries.filter(e => e.name.startsWith(partial));
  if (matches.length === 1) {
    const completed = matches[0].name + (matches[0].type === 'dir' ? sep : '');
    const nuevoLast = (dirPart ? dirPart + sep : '') + completed;
    partes[partes.length - 1] = nuevoLast;
    return { completed: partes.join(''), suggestions: [] };
  }
  if (matches.length > 1) {
    const pref = prefijoComun(matches.map(m => m.name));
    if (pref.length > partial.length) {
      const nuevoLast = (dirPart ? dirPart + sep : '') + pref;
      partes[partes.length - 1] = nuevoLast;
      return { completed: partes.join(''), suggestions: [] };
    }
    return { completed: value, suggestions: matches.map(m => m.name + (m.type === 'dir' ? sep : '')) };
  }
  return { completed: value, suggestions: [] };
}

function prefijoComun(arr) {
  if (!arr.length) return '';
  let p = arr[0];
  for (const s of arr) {
    while (!s.toLowerCase().startsWith(p.toLowerCase()) && p.length) p = p.slice(0, -1);
  }
  return p;
}

/* ---------- RETOS: validación sobre el FS activo ---------- */
const RETOS = [
  // 0: existe carpeta Proyectos en home
  fs => fs.isDir(`${fs.home}${fs.sep}Proyectos`),
  // 1: existe archivo Proyectos/notas.txt
  fs => fs.isFile(`${fs.home}${fs.sep}Proyectos${fs.sep}notas.txt`),
  // 2: Proyectos/notas.txt contiene "Hola SO"
  fs => {
    const r = fs.readFile(`${fs.home}${fs.sep}Proyectos${fs.sep}notas.txt`);
    return r.ok && r.content.includes('Hola SO');
  },
  // 3: existe descargas/tarea.md Y cwd == home
  fs => fs.isFile(`${fs.home}${fs.sep}${fs.shell === 'windows' ? 'Descargas' : 'descargas'}${fs.sep}tarea.md`) && fs.cwd === fs.home,
  // 4: Proyectos ya no existe (fue borrado recursivo)
  fs => !fs.exists(`${fs.home}${fs.sep}Proyectos`)
];

function validarRetos(silencioso) {
  const sh = shellActiva();
  if (!sh) return;
  const fs = sh.fs;
  let cambio = false;
  RETOS.forEach((cond, i) => {
    const ok = !!cond(fs);
    if (ok && !estado.retos.has(i)) {
      estado.retos.add(i);
      estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_RETO);
      if (!silencioso) mostrarToast(`🎯 Reto ${i + 1} superado · +${XP_POR_RETO} XP`);
      cambio = true;
    }
  });
  pintarRetos();
  if (cambio) {
    if (estado.retos.size === RETOS.length) otorgarBadge('🏅 Retos CLI completados');
    guardarProgreso();
    actualizarUI();
  }
}

function pintarRetos() {
  document.querySelectorAll('#retosPanel .reto').forEach((el, i) => {
    const hecho = estado.retos.has(i);
    el.classList.toggle('completado', hecho);
    const est = el.querySelector('.reto-estado');
    if (est) {
      est.className = 'reto-estado ' + (hecho ? 'completado' : 'pendiente');
      est.textContent = hecho ? '✅ Completado' : '⏳ Pendiente';
    }
  });
}

/* diagnóstico contextual de un reto según el estado actual del FS activo */
function diagnosticReto(i) {
  const fs = shellActiva().fs;
  const home = fs.home, sep = fs.sep;
  const p = `${home}${sep}Proyectos`;
  const desc = `${home}${sep}${fs.shell === 'windows' ? 'Descargas' : 'descargas'}`;
  switch (i) {
    case 0:
      if (fs.isDir(p)) return '✅ La carpeta "Proyectos" ya existe.';
      return (fs.cwd !== home ? 'No estás en tu carpeta personal. Primero vuelve con `cd`. ' : '')
        + 'Falta crear la carpeta. Prueba: mkdir Proyectos';
    case 1:
      if (!fs.isDir(p)) return 'Primero crea "Proyectos" (Reto 1): mkdir Proyectos';
      return fs.isFile(`${p}${sep}notas.txt`) ? '✅ "notas.txt" ya existe.'
        : 'Falta el archivo. Prueba: touch Proyectos/notas.txt';
    case 2: {
      const r = fs.readFile(`${p}${sep}notas.txt`);
      if (!r.ok) return 'Primero crea Proyectos/notas.txt (Reto 2).';
      return r.content.includes('Hola SO') ? '✅ El archivo contiene "Hola SO".'
        : 'Escribe el contenido. Prueba: echo Hola SO > Proyectos/notas.txt';
    }
    case 3:
      if (!fs.isFile(`${desc}${sep}tarea.md`))
        return 'Entra a descargas (cd descargas), crea tarea.md (touch tarea.md) y vuelve con cd.';
      return fs.cwd === fs.home ? '✅ "tarea.md" creado y volviste a tu carpeta personal.'
        : 'Te falta volver a tu carpeta personal. Prueba: cd (sin argumentos)';
    case 4:
      return fs.exists(p) ? 'Borra la carpeta con todo. Prueba: rm -r Proyectos'
        : '✅ La carpeta "Proyectos" ya no existe.';
    default:
      return 'Reto desconocido.';
  }
}

/* ---------- TECLADO GLOBAL (navegación entre módulos) ---------- */
function configurarTeclado() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') {
      if (estado.moduloActual < TOTAL_MODULOS - 1) irAModulo(estado.moduloActual + 1);
    } else if (e.key === 'ArrowLeft') {
      if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
    }
  });
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '30px', right: '30px',
    background: 'linear-gradient(135deg, #00ff9d, #22d3ee)',
    color: '#000', padding: '0.9rem 1.4rem', borderRadius: '30px',
    fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000', transition: 'all 0.4s ease',
    opacity: '0', transform: 'translateY(20px)',
    maxWidth: '90%', fontSize: '0.92rem'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}