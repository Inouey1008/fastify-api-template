import esbuild from "esbuild";
import glob from "fast-glob";

const watchMode = process.argv.includes("--watch");

const build = async () => {
  const entryPoints = await glob(["src/**/*.ts"]);

  console.log("📦 Building...");

  try {
    const context = await esbuild.context({
      entryPoints,
      outdir: "dist",
      bundle: true,
      platform: "node",
      target: "node22",
      sourcemap: true,
      minify: true,
      logLevel: "info",
    });

    if (watchMode) {
      await context.watch();
      console.log("👀 Watching for changes...");
    } else {
      await context.rebuild();
      await context.dispose();
      console.log("✅ Build succeeded");
    }
  } catch (err) {
    console.error("❌ Build failed:", err);
    process.exit(1);
  }
};

build();
