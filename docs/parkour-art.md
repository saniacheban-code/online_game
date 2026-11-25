# Графика паркура: происхождение и промпты

Режим: встроенный генератор изображений. Итоговый фон скопирован в `assets/images/parkour-garden.png`. Другие картинки не заменялись.

## Успешная генерация

Use case: stylized-concept. Asset type: original educational parkour game background, landscape 1536 by 1024. An enchanting futuristic botanical observatory at blue hour, distant glass domes and terraces on solid cliffs, luminous cyan and amber accents, softly glowing plants, stars and gentle atmospheric mist, layered panoramic environment with open central lower half for rendering a three-lane running track in code. Polished painterly 3D game art, pleasing depth, crisp but not noisy, original world, no recognizable franchise, no characters, no text, no interface, no logos, no foreground obstacles and no roads painted in. Horizontal full-bleed composition.

## Не выполненная генерация спрайтов

Запрашивался прозрачный атлас 4 × 2 с четырьмя фазами бега оригинального робота, вторым персонажем, воротами, платформой и лазером. Сервис вернул usage_limit_reached. Изображения по этому запросу нет. В сборке используются существующие прозрачные спрайты двух бегунов, их точные пути указаны в parkour.md; фазы бега и все эффекты анимированы кодом. Ворота и геометрические препятствия — элементы Canvas, фоновая и дорожная текстуры — PNG/WebP.
