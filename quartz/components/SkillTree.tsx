import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const SkillTree: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "skill-tree") {
    return null
  }

  return (
    <div class={classNames(displayClass, "skill-tree-root")}>
      <div class="skill-tree-header">
        <div class="stat-card streak">
          <span class="label">STREAK</span>
          <span class="value" id="streak-val">...</span>
          <span class="unit">DAYS</span>
        </div>
        <div class="stat-card level">
          <span class="label">LEVEL</span>
          <span class="value" id="level-val">...</span>
        </div>
        <div class="stat-card xp">
          <span class="label">TOTAL XP</span>
          <span class="value" id="xp-val">...</span>
        </div>
      </div>

      <div class="skill-tree-viz">
        <div class="loading-overlay" id="skill-loading">LOADING DATA FROM SUPABASE...</div>
        <svg id="skill-tree-svg" viewBox="0 0 800 600">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#00f2ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0062ff;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="inventory-section">
        <h3>🎁 UNLOCKED BOOSTER PACKS</h3>
        <div class="inventory-grid" id="inventory-grid">
          <div class="empty-msg">Reach Level 5 to unlock your first pack!</div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        async function fetchSkillData() {
          const PROJECT_URL = 'https://lhyyffybxvcdkmltsyke.supabase.co';
          const ANON_KEY = 'sb_publishable_w3TQTxhvv4u2sWnuek5MBQ_63ViYELD';
          
          try {
            // Fetch User Stats
            const statsRes = await fetch(\`\${PROJECT_URL}/rest/v1/user_stats?username=eq.dannywchen&select=*\`, {
              headers: { 'apikey': ANON_KEY, 'Authorization': \`Bearer \${ANON_KEY}\` }
            });
            const stats = (await statsRes.json())[0];

            // Fetch Skills
            const skillsRes = await fetch(\`\${PROJECT_URL}/rest/v1/skills?select=*\`, {
              headers: { 'apikey': ANON_KEY, 'Authorization': \`Bearer \${ANON_KEY}\` }
            });
            const skills = await skillsRes.json();

            // Update UI
            document.getElementById('streak-val').innerText = stats.streak_count;
            document.getElementById('level-val').innerText = stats.current_level;
            document.getElementById('xp-val').innerText = stats.total_xp;
            document.getElementById('skill-loading').style.display = 'none';

            renderTree(skills);
          } catch (e) {
            console.error("Skill Tree Load Error:", e);
            document.getElementById('skill-loading').innerText = "ERROR LOADING DATA";
          }
        }

        function renderTree(skills) {
          const svg = document.getElementById('skill-tree-svg');
          const centerX = 400;
          const centerY = 300;
          
          skills.forEach((skill, i) => {
            const angle = (i * 2 * Math.PI) / skills.length;
            const distance = 180;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            // Connector Line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", centerX);
            line.setAttribute("y1", centerY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "#00f2ff");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("filter", "url(#glow)");
            line.style.opacity = "0.4";
            svg.appendChild(line);

            // Skill Node
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", 30 + (skill.level * 2));
            circle.setAttribute("fill", "#0a0a0a");
            circle.setAttribute("stroke", "#00f2ff");
            circle.setAttribute("stroke-width", "3");
            circle.setAttribute("filter", "url(#glow)");
            g.appendChild(circle);

            const icon = document.createElementNS("http://www.w3.org/2000/svg", "text");
            icon.setAttribute("x", x);
            icon.setAttribute("y", y + 8);
            icon.setAttribute("text-anchor", "middle");
            icon.setAttribute("font-size", "24px");
            icon.textContent = skill.icon || '🧠';
            g.appendChild(icon);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", y + 55);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("fill", "#fff");
            label.setAttribute("font-family", "JetBrains Mono");
            label.setAttribute("font-size", "12px");
            label.textContent = \`Lvl \${skill.level} \${skill.name}\`;
            g.appendChild(label);

            svg.appendChild(g);
          });

          // Core Node
          const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          core.setAttribute("cx", centerX);
          core.setAttribute("cy", centerY);
          core.setAttribute("r", "45");
          core.setAttribute("fill", "url(#neonGradient)");
          core.setAttribute("filter", "url(#glow)");
          svg.appendChild(core);
        }

        document.addEventListener("nav", fetchSkillData);
        fetchSkillData();
      `}} />
    </div>
  )
}

SkillTree.css = \`
.skill-tree-root {
  margin-top: 2rem;
  padding: 3rem;
  background: #050505;
  border: 1px solid #333;
  color: #fff;
  border-radius: 4px;
}

.skill-tree-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  padding: 1.5rem;
  background: #0a0a0a;
  border: 1px solid #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #00f2ff;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);
}

.stat-card .label {
  font-family: 'JetBrains Mono', monospace;
  color: #666;
  font-size: 0.7rem;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.stat-card .value {
  font-family: 'Syne', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
}

.skill-tree-viz {
  position: relative;
  width: 100%;
  height: 600px;
  background: #000;
  border: 1px solid #111;
  border-radius: 8px;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'JetBrains Mono';
  color: #444;
  letter-spacing: 4px;
}

#skill-tree-svg {
  width: 100%;
  height: 100%;
}

.inventory-section {
  margin-top: 3rem;
  border-top: 1px solid #222;
  padding-top: 2rem;
}

.inventory-section h3 {
  font-family: 'Syne', sans-serif;
  letter-spacing: 2px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  color: #666;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.inventory-item {
  aspect-ratio: 1;
  background: #0a0a0a;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.inventory-item:hover {
  transform: translateY(-5px);
  border-color: #00f2ff;
}

.empty-msg {
  grid-column: 1 / -1;
  text-align: center;
  color: #444;
  font-family: 'JetBrains Mono';
  font-size: 0.8rem;
  padding: 2rem;
}
\`

export default (() => SkillTree) satisfies QuartzComponentConstructor
