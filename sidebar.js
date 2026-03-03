const baseURL = window.location.origin;
const cacheBuster = Math.floor(Date.now() / 86400000);

// נתונים נטענים פעם אחת ומשותפים בין הסיידבר לדף
window.portfolioData = (async () => {
    try {
        const res = await fetch(`${baseURL}/list.txt?v=${cacheBuster}`);
        if (!res.ok) return { folders: [], projects: [] };

        const folders = (await res.text()).split(/\r?\n/).filter(f => f.trim() !== "");

        const projects = await Promise.all(folders.map(async (f) => {
            try {
                const iR = await fetch(`${baseURL}/images/${f}/info.txt?v=${cacheBuster}`);
                const title = iR.ok ? (await iR.text()).split('\n')[0].trim() : f;
                return { folder: f, title };
            } catch {
                return { folder: f, title: f };
            }
        }));

        return { folders, projects };
    } catch (e) {
        console.error("Portfolio data error:", e);
        return { folders: [], projects: [] };
    }
})();

async function injectSidebar() {
    if (document.getElementById('side-nav')) return;

    document.body.insertAdjacentHTML('afterbegin', `
    <nav id="side-nav">
        <div class="project-index-title">Project Index</div>
        <div id="side-project-list" class="project-list-nav"></div>
    </nav>`);

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
        const { projects } = await window.portfolioData;
        const sideList = document.getElementById('side-project-list');
        if (!sideList) return;

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
