// הגדרה דינמית שמוודאת שהתמונות ייטענו מהדומיין שבו הגולש נמצא כרגע
const baseURL = window.location.origin;

async function injectSidebar() {
    if (document.getElementById('side-nav')) return;

    const navHTML = `
    <nav id=\"side-nav\">
        <div class=\"project-index-title\">Project Index</div>
        <div id=\"side-project-list\" class=\"project-list-nav\"></div>
    </nav>`;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    const initMenu = () => {
        const projectsBtn = document.getElementById('projects-trigger');
        if (projectsBtn) {
            projectsBtn.onclick = (e) => {
                e.stopPropagation();
                document.body.classList.toggle('nav-open');
            };
        }
    };

    initMenu();
    window.addEventListener('load', initMenu);

    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-open') && !e.target.closest('#side-nav')) {
            document.body.classList.remove('nav-open');
        }
    });

    try {
        const res = await fetch(`${baseURL}/list.txt?v=${Date.now()}`);
        const folders = (await res.text()).split(/\r?\n/).filter(f => f.trim() !== "");
        const sideList = document.getElementById('side-project-list');
        if (!sideList) return;

        for (const f of folders) {
            const iR = await fetch(`${baseURL}/images/${f}/info.txt`);
            if (iR.ok) {
                const title = (await iR.text()).split('\n')[0].trim();
                sideList.innerHTML += `<a href="project.html?folder=${f}">${title}</a>`;
            }
        }
    } catch (e) { console.error("Sidebar error:", e); }
}

injectSidebar();
