import { QuartzEmitterPlugin } from "../types"
import { SimpleSlug, simplifySlug } from "../../util/path"

export const SkillTreeStats: QuartzEmitterPlugin = () => {
  return {
    name: "SkillTreeStats",
    getQuartzComponents() {
      return []
    },
    async emit(ctx, content, _resources): Promise<string[]> {
      const stats = {
        username: "dannywchen",
        dailyNotes: 0,
        skills: {} as Record<string, number>,
        totalNotes: content.length,
      }

      const today = new Date().toISOString().split("T")[0]

      for (const [_tree, fileData] of content) {
        if (!fileData.slug) continue
        const slug = simplifySlug(fileData.slug)
        const folder = slug.split("/")[0] || "General"
        if (folder === "skill-tree" || folder === "static") continue

        stats.skills[folder] = (stats.skills[folder] || 0) + 1
        const createdDate = fileData.dates?.created?.toISOString().split("T")[0]
        if (createdDate === today) {
          stats.dailyNotes++
        }
      }

      // Sync with Supabase Edge Function
      try {
        console.log("🛡️ Syncing Skill Tree stats to Supabase...")
        const response = await fetch("https://lhyyffybxvcdkmltsyke.supabase.co/functions/v1/update-stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeXlmZnlieHZjZGttbHRzeWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTM3NjQsImV4cCI6MjA5MzA4OTc2NH0.EKFmhpIh6YKSxqjLG5uI3LyXaB0Ri4Pobh3SechJ44s"
          },
          body: JSON.stringify(stats),
        })
        if (!response.ok) {
          console.error("❌ Failed to sync Skill Tree stats:", await response.text())
        } else {
          console.log("✅ Skill Tree stats synced successfully!")
        }
      } catch (e) {
        console.error("❌ Error syncing Skill Tree stats:", e)
      }

      return [
        await ctx.argv.output.write({
          slug: "static/skill-stats" as SimpleSlug,
          ext: ".json",
          content: JSON.stringify(stats),
        }),
      ]
    },
  }
}
