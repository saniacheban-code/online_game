# Графика Экспедиции

Создана специально для этой игры встроенным генератором изображений. Используются два итоговых PNG; сетку, туман, воду, метки, анимации и интерфейс рисует CSS. Подписей, цифр и вариантов ответа в изображениях нет.

## Фон — генерация с нуля

Файл: `assets/images/expedition-island.png`.

Промпт: Beautiful top-down painted strategy game island, lush green meadow, turquoise ocean along the outer border, open central 85 percent for a seven by seven gameplay grid, soft natural meadow texture, subtle coastal cliffs, bright inviting exploration mood, no paths, no grid, no buildings, no characters, no text or interface. Square composition.

## Атлас — генерация с нуля и правка прозрачности

Файл: `assets/images/expedition-atlas.png`, 1536 × 1024, три столбца и две строки одинаковых ячеек.

Промпт: Cohesive hand-painted strategy game sprite atlas on transparent background, exactly three columns and two rows of equally sized cells. Top row: cluster of lush trees; rocky snow-capped mountain; friendly fantasy castle with teal roofs. Bottom row: open treasure chest; original girl explorer in teal and ochre outdoor clothing; original boy explorer in coral and brown outdoor clothing. Top-down three-quarter view, readable silhouettes, centered individual objects with generous empty margins, consistent lighting and scale, no text, no grid lines, no background scenery, no shadows outside each object.

После первого результата выполнена правка изображения: Preserve all six sprites, their size, layout, colors and details. Remove the pale background completely to genuine alpha transparency, including empty margins and spaces between sprites. Keep only the six objects and their close contact shadows. Do not add anything. Финальный файл содержит прозрачные пиксели, используется как CSS-атлас 300% × 200%.
