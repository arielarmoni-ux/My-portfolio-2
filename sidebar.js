// הגדרה דינמית שמוודאת שהתמונות ייטענו מהדומיין שבו הגולש נמצא כרגע
const baseURL = window.location.origin;

// Cache buster יומי - משתנה פעם ביום בלבד
const cacheBuster = Math.floor(Date.now() / 86400000);

async function injectSidebar() {
    if (document.getElementById('side-nav')) return;

    const navHTML = `
    <nav id="side-nav">
        <div class="project-index-title">Project Index</div>
        <div id="side-project-list" class="project-list-nav"></div>
    </nav>`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    const projectsBtn = document.getElementById('projects-trigger');
    if (projectsBtn) {
        projectsBtn.onclick = (e) => {
            e.stopPropagation();
            document.body.classList.toggle('nav-open');
        };
    }

    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-open') && !e.target.closest('#side-nav')) {
            document.body.classList.remove('nav-open');
        }
    });

    try {
        const res = await fetch(`${baseURL}/list.txt?v=${cacheBuster}`);
        const folders = (await res.text()).split(/\r?\n/).filter(f => f.trim() !== "");
        const sideList = document.getElementById('side-project-list');
        if (!sideList) return;

        // טעינה מקבילית של כל כותרות הפרויקטים
        const titlePromises = folders.map(async (f) => {
            try {
                const iR = await fetch(`${baseURL}/images/${f}/info.txt?v=${cacheBuster}`);
                const title = iR.ok ? (await iR.text()).split('\n')[0].trim() : f;
                return { folder: f, title };
            } catch {
                return { folder: f, title: f };
            }
        });

        const projects = await Promise.all(titlePromises);

        // הוספה לDOM פעם אחת בלבד - יעיל יותר מ-innerHTML += בלולאה
        const fragment = document.createDocumentFragment();
        projects.forEach(({ folder, title }) => {
            const a = document.createElement('a');
            a.href = `project.html?folder=${folder}`;
            a.textContent = title;
            fragment.appendChild(a);
        });
        sideList.appendChild(fragment);

    } catch (e) { console.error("Sidebar error:", e); }
}

injectSidebar();
