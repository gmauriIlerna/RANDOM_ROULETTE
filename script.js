const baseGroups = [
  { id: "G1", students: ["Javier Casas", "Claudia Casol", "Manel Llurda"] },
  { id: "G2", students: ["Jordi Coso", "Kike Denamiel", "Josep Miquel Sert"] },
  { id: "G3", students: ["Eric Admella", "Evidence", "Aleix Molina"] },
  { id: "G4", students: ["Julen", "Viktor", "Marcel Codina"] },
  { id: "G5", students: ["Roger Puig", "Marc Orus", "Alvaro Martinez"] },
  { id: "G6", students: ["Victor Chavarria", "Biel Puiggros", "Unai Martín Rivas", "Estel Jordan"] },
  { id: "G7", students: ["Jorge Luis Claros", "Jairo Joao", "Eric Neila"] },
  { id: "G8", students: ["Ivan Falcó", "Izan Martín", "Xavi Ribes"] },
  { id: "G9", students: ["Gabriel Andrei Milea", "Óscar Muñoz", "Ian Rubio"] },
  { id: "G10", students: ["Eric Chavarria"] },
];

const colors = ["#456be0", "#ff7b70", "#8ef28e", "#f2dda9", "#d596d6"];
const wheel = document.querySelector("#wheel");
const ctx = wheel.getContext("2d");
const groupList = document.querySelector("#groupList");
const groupTemplate = document.querySelector("#groupTemplate");
const groupSelect = document.querySelector("#groupSelect");
const studentForm = document.querySelector("#studentForm");
const studentName = document.querySelector("#studentName");
const spinButton = document.querySelector("#spinButton");
const resetButton = document.querySelector("#resetButton");
const hideWinnerButton = document.querySelector("#hideWinnerButton");
const addGroupButton = document.querySelector("#addGroupButton");
const result = document.querySelector("#result");

let groups = baseGroups.map((group) => ({ ...group, students: [...group.students], enabled: true }));
let rotation = 0;
let spinning = false;
let lastWinnerId = null;

function activeGroups() {
  return groups.filter((group) => group.enabled);
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function drawWheel() {
  const active = activeGroups();
  const size = wheel.width;
  const center = size / 2;
  const radius = center - 8;

  ctx.clearRect(0, 0, size, size);

  if (active.length === 0) {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#e7e1dc";
    ctx.fill();
    ctx.fillStyle = "#6c717a";
    ctx.font = "700 42px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sin grupos activos", center, center);
    return;
  }

  const slice = (Math.PI * 2) / active.length;
  active.forEach((group, index) => {
    const start = rotation + index * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(33, 34, 38, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#090a0c";
    ctx.font = active.length > 8 ? "700 58px system-ui" : "700 72px system-ui";
    ctx.fillText(group.id, radius - 48, 0);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(center, center, 24, 0, Math.PI * 2);
  ctx.fillStyle = "#686866";
  ctx.fill();
}

function renderEditor() {
  groupList.textContent = "";
  groupSelect.textContent = "";

  groups.forEach((group, groupIndex) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.id;
    groupSelect.append(option);

    const card = groupTemplate.content.firstElementChild.cloneNode(true);
    const enabled = card.querySelector(".group-enabled");
    const name = card.querySelector(".group-name");
    const moveUp = card.querySelector(".move-up");
    const moveDown = card.querySelector(".move-down");
    const removeGroup = card.querySelector(".remove-group");
    const studentList = card.querySelector(".student-list");

    enabled.checked = group.enabled;
    name.textContent = group.id;
    card.classList.toggle("disabled", !group.enabled);
    moveUp.disabled = groupIndex === 0;
    moveDown.disabled = groupIndex === groups.length - 1;

    enabled.addEventListener("change", () => {
      group.enabled = enabled.checked;
      lastWinnerId = null;
      render();
    });

    removeGroup.addEventListener("click", () => {
      groups.splice(groupIndex, 1);
      lastWinnerId = null;
      render();
    });

    moveUp.addEventListener("click", () => {
      moveGroup(groupIndex, groupIndex - 1);
    });

    moveDown.addEventListener("click", () => {
      moveGroup(groupIndex, groupIndex + 1);
    });

    group.students.forEach((student, studentIndex) => {
      const item = document.createElement("li");
      const label = document.createElement("span");
      const removeStudent = document.createElement("button");
      label.textContent = student;
      removeStudent.className = "remove-student";
      removeStudent.type = "button";
      removeStudent.title = "Quitar alumno";
      removeStudent.textContent = "×";
      removeStudent.addEventListener("click", () => {
        group.students.splice(studentIndex, 1);
        renderEditor();
      });
      item.append(label, removeStudent);
      studentList.append(item);
    });

    groupList.append(card);
  });
}

function moveGroup(from, to) {
  if (to < 0 || to >= groups.length) return;
  const [group] = groups.splice(from, 1);
  groups.splice(to, 0, group);
  lastWinnerId = null;
  result.textContent = "Orden actualizado";
  render();
}

function render() {
  drawWheel();
  renderEditor();
  hideWinnerButton.disabled = !lastWinnerId;
  spinButton.disabled = spinning || activeGroups().length === 0;
}

function setResult(group) {
  const names = group.students.length ? group.students.join(", ") : "Sin alumnos";
  result.textContent = `${group.id}: ${names}`;
}

function spin() {
  const active = activeGroups();
  if (spinning || active.length === 0) return;

  const winnerIndex = active.length >= 3 ? 2 : active.length - 1;
  const winner = active[winnerIndex];
  const slice = (Math.PI * 2) / active.length;
  const targetMid = winnerIndex * slice + slice / 2;
  const pointerAngle = 0;
  const current = normalizeAngle(rotation);
  const desired = normalizeAngle(pointerAngle - targetMid);
  const forward = normalizeAngle(desired - current);
  const extraTurns = 7 + Math.floor(Math.random() * 3);
  const start = rotation;
  const end = rotation + extraTurns * Math.PI * 2 + forward;
  const duration = 4300;
  const started = performance.now();

  spinning = true;
  spinButton.disabled = true;
  result.textContent = "Girando...";

  function frame(now) {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    rotation = start + (end - start) * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    rotation = desired;
    spinning = false;
    lastWinnerId = winner.id;
    setResult(winner);
    render();
  }

  requestAnimationFrame(frame);
}

function resetGroups() {
  groups = baseGroups.map((group) => ({ ...group, students: [...group.students], enabled: true }));
  rotation = 0;
  lastWinnerId = null;
  result.textContent = "Preparada";
  render();
}

function hideWinner() {
  const winner = groups.find((group) => group.id === lastWinnerId);
  if (!winner) return;
  winner.enabled = false;
  lastWinnerId = null;
  result.textContent = "Seleccionado oculto";
  render();
}

function addGroup() {
  const nextNumber =
    groups
      .map((group) => Number(group.id.replace(/\D/g, "")))
      .filter(Number.isFinite)
      .reduce((max, number) => Math.max(max, number), 0) + 1;
  groups.push({ id: `G${nextNumber}`, students: [], enabled: true });
  render();
}

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = studentName.value.trim();
  const group = groups.find((item) => item.id === groupSelect.value);
  if (!name || !group) return;
  group.students.push(name);
  studentName.value = "";
  renderEditor();
});

spinButton.addEventListener("click", spin);
resetButton.addEventListener("click", resetGroups);
hideWinnerButton.addEventListener("click", hideWinner);
addGroupButton.addEventListener("click", addGroup);

window.addEventListener("keydown", (event) => {
  if (event.target.matches("input, select")) return;
  if (event.code === "Space") {
    event.preventDefault();
    spin();
  }
  if (event.key.toLowerCase() === "r") resetGroups();
  if (event.key.toLowerCase() === "s") hideWinner();
});

render();
