import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const SkillTree: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "skill-tree") {
    return null
  }

  return (
    <div class={classNames(displayClass, "skill-tree-root")}>
      <div class="skill-tree-header">
        <div class="stat-item">
          <span class="label">STREAK</span>
          <span class="value" id="streak-val">0</span>
        </div>
        <div class="stat-item">
          <span class="label">LEVEL</span>
          <span class="value" id="level-val">1</span>
        </div>
        <div class="stat-item">
          <span class="label">TOTAL XP</span>
          <span class="value" id="xp-val">0</span>
        </div>
      </div>

      <div class="skill-tree-container">
        <div class="loading-overlay" id="skill-loading">INITIALIZING GRAPH...</div>
        <svg id="skill-tree-svg"></svg>
      </div>

      <div class="inventory-section">
        <h3>INVENTORY</h3>
        <div class="inventory-grid" id="inventory-grid">
          <div class="empty-msg">LEVEL 5 REQUIRED FOR BOOSTER PACKS</div>
        </div>
      </div>

      <script src="https://d3js.org/d3.v7.min.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        async function fetchSkillData() {
          const PROJECT_URL = 'https://lhyyffybxvcdkmltsyke.supabase.co';
          const ANON_KEY = 'sb_publishable_w3TQTxhvv4u2sWnuek5MBQ_63ViYELD';
          
          try {
            const [statsRes, skillsRes] = await Promise.all([
              fetch(\`\${PROJECT_URL}/rest/v1/user_stats?username=eq.dannywchen&select=*\`, {
                headers: { 'apikey': ANON_KEY, 'Authorization': \`Bearer \${ANON_KEY}\` }
              }),
              fetch(\`\${PROJECT_URL}/rest/v1/skills?select=*\`, {
                headers: { 'apikey': ANON_KEY, 'Authorization': \`Bearer \${ANON_KEY}\` }
              })
            ]);

            const stats = (await statsRes.json())[0];
            const skills = await skillsRes.json();

            document.getElementById('streak-val').innerText = stats.streak_count;
            document.getElementById('level-val').innerText = stats.current_level;
            document.getElementById('xp-val').innerText = stats.total_xp;
            document.getElementById('skill-loading').style.display = 'none';

            renderGraph(skills);
          } catch (e) {
            console.error("Skill Tree Load Error:", e);
            document.getElementById('skill-loading').innerText = "CONNECTION FAILED";
          }
        }

        function renderGraph(skills) {
          const container = document.querySelector('.skill-tree-container');
          const width = container.clientWidth;
          const height = 600;
          const svg = d3.select("#skill-tree-svg")
            .attr("width", width)
            .attr("height", height);

          svg.selectAll("*").remove();

          const nodes = [
            { id: "Core", group: 0, level: 10, icon: "🧠" },
            ...skills.map(s => ({ id: s.name, group: 1, level: s.level, icon: s.icon || "📄" }))
          ];

          const links = skills.map(s => ({ source: "Core", target: s.name }));

          const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2));

          const link = svg.append("g")
            .attr("stroke", "var(--gray)")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1);

          const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

          node.append("circle")
            .attr("r", d => d.id === "Core" ? 30 : 20 + d.level)
            .attr("fill", "var(--light)")
            .attr("stroke", "var(--dark)")
            .attr("stroke-width", 2);

          node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", 5)
            .attr("font-size", d => d.id === "Core" ? "20px" : "14px")
            .text(d => d.icon);

          node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.id === "Core" ? 50 : 40)
            .attr("font-family", "var(--bodyFont)")
            .attr("font-size", "10px")
            .attr("fill", "var(--dark)")
            .text(d => d.id === "Core" ? "MY WIKI" : \`LVL \${d.level} \${d.id.toUpperCase()}\`);

          simulation.on("tick", () => {
            link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);

            node
              .attr("transform", d => \`translate(\${d.x},\${d.y})\`);
          });

          function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }

          function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }

          function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }
        }

        document.addEventListener("nav", fetchSkillData);
        fetchSkillData();
      `}} />
    </div>
  )
}

SkillTree.css = `
.skill-tree-root {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid var(--gray);
}

.skill-tree-header {
  display: flex;
  gap: 3rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--gray);
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 0.6rem;
  color: var(--gray);
  letter-spacing: 1px;
}

.stat-item .value {
  font-size: 1.5rem;
  font-weight: 600;
  font-family: var(--headerFont);
}

.skill-tree-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: var(--light);
  cursor: grab;
}

.skill-tree-container:active {
  cursor: grabbing;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  color: var(--gray);
}

.inventory-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray);
}

.inventory-section h3 {
  font-size: 0.8rem;
  margin-bottom: 1rem;
  color: var(--gray);
}

.empty-msg {
  font-size: 0.7rem;
  color: var(--lightgray);
}
`

export default (() => SkillTree) satisfies QuartzComponentConstructor
