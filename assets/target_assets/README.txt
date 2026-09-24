Arrow Orbit target assets

Use in the game:
- homepage.webp
- generated_targets/generated_target_01.png: levels 1-5
- generated_targets/generated_target_02.png: levels 6-10
- generated_targets/generated_target_03.png: levels 11-15
- generated_targets/generated_target_04.png: levels 16-20
- generated_targets/generated_target_05.png: levels 21-25
- generated_targets/generated_target_06.png: levels 26-30
- generated_targets/generated_target_07.png: levels 31-35
- generated_targets/generated_target_08.png: levels 36-40
- generated_targets/generated_target_09.png: levels 41-45
- generated_targets/generated_target_10.png: levels 46-50

Keep as alternatives for now:
- generated_sources: chroma-key source files for the generated target set.
- clean_targets: cleaned versions of the earlier target set.
- webp_light_512: smaller UI previews if needed.
- targets: WebP target variants without alpha. Do not use for main boards.
- png_optimized_768: PNG fallback/source variants. Do not import these unless WebP causes a platform issue.

Decision:
- Use generated transparent PNG files for main target boards.
- Use homepage.webp for the first menu screen.
- Main target boards are wired by five-level bands.
