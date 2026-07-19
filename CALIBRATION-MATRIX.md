# CALIBRATION-MATRIX

This is the durable 25-food benchmark matrix for every FoodRanked category. Each category is partitioned into fixed 5-food S/A/B/C/D anchor buckets from raw ruleset scores, then mapped onto shared universal tier thresholds with category-specific score calibration anchors.

Shared tier thresholds for internal calibrated/ranking scores: S 80-100 | A 60-79.9999 | B 40-59.9999 | C 20-39.9999 | D 0-19.9999

Public `overallScore` is snapped from the final tier, using `D=20`, `C=40`, `B=60`, `A=80`, `S=100`. The calibrated scores below remain the audit and tier-placement benchmark values, not the displayed final score.

## dairy
- raw thresholds: S 50.0714-100 | A 44.7857-50.0713 | B 39.9405-44.7856 | C 36.5596-39.9404 | D 0-36.5595
- calibration anchors: 0->0 | 36.5596->20 | 39.9405->40 | 44.7857->60 | 50.0714->80 | 100->100

### S
- Quark (Plain) (quark-plain) - calibrated 81.3543, raw 53.4524
- Skyr (Plain) (skyr-plain) - calibrated 81.3543, raw 53.4524
- Cottage Cheese (cottage-cheese) - calibrated 81.0205, raw 52.619
- Parmesan (parmesan) - calibrated 80.3529, raw 50.9524
- Cheddar Cheese (cheddar-cheese) - calibrated 80.0286, raw 50.1429

### A
- Whey Protein Isolate (whey-protein-isolate) - calibrated 79.7298, raw 50
- Greek Yogurt (greek-yogurt) - calibrated 76.6669, raw 49.1905
- Swiss Cheese (swiss-cheese) - calibrated 76.6669, raw 49.1905
- Halloumi (halloumi) - calibrated 63.8738, raw 45.8095
- Mozzarella (mozzarella) - calibrated 61.8919, raw 45.2857

### B
- Feta (feta) - calibrated 57.9361, raw 44.2857
- Skimmed Milk (milk-skimmed) - calibrated 53.6118, raw 43.2381
- Ricotta (ricotta) - calibrated 53.2189, raw 43.1429
- Plain Kefir (kefir-plain) - calibrated 48.6977, raw 42.0476
- Whole Milk (milk-whole) - calibrated 40.2456, raw 40

### C
- Goat Yogurt (Plain) (goat-yogurt-plain) - calibrated 39.648, raw 39.881
- Labneh (Plain) (labneh-plain) - calibrated 38.2395, raw 39.6429
- Plain Yogurt (plain-yogurt) - calibrated 36.9718, raw 39.4286
- Processed Cheese Slices (processed-cheese-slices) - calibrated 36.831, raw 39.4048
- Sheep Yogurt (Plain) (sheep-yogurt-plain) - calibrated 26.9715, raw 37.7381

### D
- Cream Cheese (cream-cheese) - calibrated 19.3552, raw 35.381
- Chocolate Milk (chocolate-milk) - calibrated 19.0817, raw 34.881
- Fruit Yogurt (Sweetened) (fruit-yogurt-sweetened) - calibrated 17.7792, raw 32.5
- Sweetened Condensed Milk (sweetened-condensed-milk) - calibrated 14.8486, raw 27.1429
- Ice Cream (ice-cream) - calibrated 9.5864, raw 17.5238

## fruits
- raw thresholds: S 52.5952-100 | A 48.5-52.5951 | B 45.2698-48.4999 | C 43.2857-45.2697 | D 0-43.2856
- calibration anchors: 0->0 | 43.2857->20 | 45.2698->40 | 48.5->60 | 52.5952->80 | 100->100

### S
- Guava (guava) - calibrated 82.6285, raw 58.8254
- Strawberries (strawberries) - calibrated 81.3427, raw 55.7778
- Blackberries (blackberries) - calibrated 80.961, raw 54.873
- Raspberries (raspberries) - calibrated 80.961, raw 54.873
- Lemon (lemon) - calibrated 80.1105, raw 52.8571

### A
- Grapefruit (grapefruit) - calibrated 78.7209, raw 52.3333
- Orange (orange) - calibrated 77.4033, raw 52.0635
- Kiwi (kiwi) - calibrated 71.0466, raw 50.7619
- Dried Apricots (dried-apricots) - calibrated 66.1628, raw 49.7619
- Papaya (papaya) - calibrated 66.1628, raw 49.7619

### B
- Dried Figs (dried-figs) - calibrated 52.1869, raw 47.2381
- Pineapple (pineapple) - calibrated 44.2264, raw 45.9524
- Mango (mango) - calibrated 43.9316, raw 45.9048
- Blueberries (blueberries) - calibrated 41.6711, raw 45.5397
- Apple (apple) - calibrated 40.7863, raw 45.3968

### C
- Cherries (cherries) - calibrated 38.7208, raw 45.1429
- Raisins (raisins) - calibrated 38.7208, raw 45.1429
- Pomegranate (pomegranate) - calibrated 36.3207, raw 44.9048
- Banana (banana) - calibrated 30.7202, raw 44.3492
- Pear (apple-pear) - calibrated 22.8799, raw 43.5714

### D
- Peach (peach) - calibrated 19.868, raw 43
- Watermelon (watermelon) - calibrated 17.0884, raw 36.9841
- Avocado (avocado) - calibrated 16.806, raw 36.373
- Grapes (grapes) - calibrated 16.3183, raw 35.3175
- Dates (dates) - calibrated 14.989, raw 32.4405

## grains
- raw thresholds: S 54.1384-100 | A 48.0733-54.1383 | B 43.6044-48.0732 | C 32.4787-43.6043 | D 0-32.4786
- calibration anchors: 0->0 | 32.4787->20 | 43.6044->40 | 48.0733->60 | 54.1384->80 | 100->100

### S
- Amaranth (amaranth) - calibrated 83.2383, raw 61.5641
- Oats (oats) - calibrated 81.7567, raw 58.1667
- Barley (barley-s-tier) - calibrated 80.7296, raw 55.8114
- Teff (teff) - calibrated 80.4988, raw 55.2821
- Farro (farro) - calibrated 80.0216, raw 54.188

### A
- Quinoa (quinoa) - calibrated 79.8364, raw 54.0888
- Whole Wheat (whole-wheat) - calibrated 78.1666, raw 53.5824
- Wild Rice (wild-rice) - calibrated 70.6936, raw 51.3162
- Whole-Grain Pasta (whole-grain-pasta-dry) - calibrated 69.2846, raw 50.8889
- Barley (barley) - calibrated 61.5703, raw 48.5495

### B
- Buckwheat (buckwheat) - calibrated 57.8688, raw 47.5971
- Sorghum (sorghum) - calibrated 56.0764, raw 47.1966
- Air-Popped Popcorn (popcorn-air-popped) - calibrated 55.705, raw 47.1136
- Rye (rye) - calibrated 48.6227, raw 45.5311
- Bulgur (bulgur) - calibrated 42.8853, raw 44.2491

### C
- Millet (millet) - calibrated 38.8411, raw 42.9597
- Couscous (plain-couscous) - calibrated 35.2107, raw 40.9402
- Whole-Wheat Couscous (couscous-whole-wheat) - calibrated 30.6891, raw 38.4249
- Cornmeal (cornmeal) - calibrated 21.9183, raw 33.5458
- White Bread (white-bread) - calibrated 21.1523, raw 33.1197

### D
- Instant Noodles (instant-noodles) - calibrated 19.6052, raw 31.8376
- Brown Rice (brown-rice) - calibrated 19.5654, raw 31.7729
- Corn Flakes (corn-flakes) - calibrated 18.25, raw 29.6368
- White Rice (white-rice) - calibrated 16.7656, raw 27.2262
- Rice Cakes (rice-cakes) - calibrated 13.0827, raw 21.2454

## legumes
- raw thresholds: S 56.5566-100 | A 50.6277-56.5565 | B 44.0404-50.6276 | C 32.9329-44.0403 | D 0-32.9328
- calibration anchors: 0->0 | 32.9329->20 | 44.0404->40 | 50.6277->60 | 56.5566->80 | 100->100

### S
- Mung Beans (mung-beans) - calibrated 81.3992, raw 59.596
- Tempeh (tempeh) - calibrated 81.2946, raw 59.3687
- Cannellini Beans (cannellini-beans) - calibrated 81.19, raw 59.1414
- Soybeans (soybeans) - calibrated 81.1767, raw 59.1126
- Tofu (Firm) (tofu-firm) - calibrated 80.5273, raw 57.702

### A
- Chickpeas (chickpeas) - calibrated 76.1366, raw 55.4113
- Lentils (lentils) - calibrated 67.2287, raw 52.7706
- Navy Beans (navy-beans) - calibrated 65.8412, raw 52.3593
- Black Beans (black-beans) - calibrated 61.0221, raw 50.9307
- Lima Beans (lima-beans) - calibrated 60.5843, raw 50.8009

### B
- Kidney Beans (kidney-beans) - calibrated 59.4741, raw 50.4545
- Pinto Beans (pinto-beans) - calibrated 59.2115, raw 50.368
- Split Peas (split-peas) - calibrated 58.0942, raw 50
- Black-Eyed Peas (black-eyed-peas) - calibrated 46.8565, raw 46.2987
- Falafel (falafel) - calibrated 40.3835, raw 44.1667

### C
- Hummus (hummus) - calibrated 39.7726, raw 43.9141
- Edamame (edamame) - calibrated 39.5454, raw 43.7879
- Chickpea Puffs (chickpea-puffs) - calibrated 38.5449, raw 43.2323
- Lentil Chips (lentil-chips) - calibrated 32.4885, raw 39.8687
- Green Peas (green-peas) - calibrated 20.0974, raw 32.987

### D
- Refried Beans (refried-beans) - calibrated 19.9671, raw 32.8788
- Soy Milk (Sweetened) (soy-milk-sweetened) - calibrated 18.1882, raw 29.9495
- Unsweetened Soy Milk (soy-milk-unsweetened) - calibrated 17.9823, raw 29.6104
- Soy Yogurt (Sweetened) (soy-yogurt-sweetened) - calibrated 17.7588, raw 29.2424
- Baked Beans (baked-beans) - calibrated 11.3309, raw 18.658

## meats
- raw thresholds: S 56.0555-100 | A 48.6898-56.0554 | B 42.3658-48.6897 | C 38.0787-42.3657 | D 0-38.0786
- calibration anchors: 0->0 | 38.0787->20 | 42.3658->40 | 48.6898->60 | 56.0555->80 | 100->100

### S
- Anchovies (anchovies) - calibrated 82.5137, raw 61.5787
- Sardines (sardines) - calibrated 80.8639, raw 57.9537
- Salmon (salmon) - calibrated 80.3287, raw 56.7778
- Venison (venison) - calibrated 80.2887, raw 56.6898
- Mackerel (mackerel) - calibrated 80.1433, raw 56.3704

### A
- Trout (trout) - calibrated 79.1452, raw 55.7407
- Herring (herring) - calibrated 74.5192, raw 54.037
- Beef Sirloin (beef-sirloin) - calibrated 71.8544, raw 53.0556
- Lean Beef (lean-beef) - calibrated 70.3458, raw 52.5
- Tuna (tuna) - calibrated 60.3394, raw 48.8148

### B
- Beef Liver (liver) - calibrated 59.6047, raw 48.5648
- Lamb (lamb) - calibrated 50.4978, raw 45.6852
- Chicken Breast (chicken-breast) - calibrated 45.9883, raw 44.2593
- Turkey Breast (turkey-breast) - calibrated 43.5139, raw 43.4769
- Shrimp (shrimp) - calibrated 40.3514, raw 42.4769

### C
- Pork Loin (pork-loin) - calibrated 39.4812, raw 42.2546
- Chicken Thigh (chicken-thigh) - calibrated 29.6326, raw 40.1435
- Cod (cod) - calibrated 28.0992, raw 39.8148
- Salami (salami) - calibrated 23.3477, raw 38.7963
- Duck Breast (duck-breast) - calibrated 20.9718, raw 38.287

### D
- Corned Beef (corned-beef) - calibrated 19.8906, raw 37.8704
- Pepperoni (pepperoni) - calibrated 19.4042, raw 36.9444
- Turkey Sausage (turkey-sausage) - calibrated 15.8055, raw 30.0926
- Hot Dog (hot-dog) - calibrated 13.3252, raw 25.3704
- Bacon (bacon) - calibrated 11.786, raw 22.4398

## misc
- raw thresholds: S 36.7708-100 | A 28.0833-36.7707 | B 24.1667-28.0832 | C 14.5833-24.1666 | D 0-14.5832
- calibration anchors: 0->0 | 14.5833->20 | 24.1667->40 | 28.0833->60 | 36.7708->80 | 100->100

### S
- Herbal Tea (herbal-tea) - calibrated 86.8204, raw 58.3333
- Sparkling Water (sparkling-water) - calibrated 86.8204, raw 58.3333
- Matcha (matcha) - calibrated 86.5568, raw 57.5
- Cocoa Powder (Unsweetened) (cocoa-powder-unsweetened) - calibrated 81.7068, raw 42.1667
- Green Tea (green-tea) - calibrated 80.2307, raw 37.5

### A
- Miso Paste (miso-paste) - calibrated 78.3215, raw 36.0417
- Dark Chocolate 85% (dark-chocolate-85) - calibrated 71.319, raw 33
- Black Tea (tea-black) - calibrated 62.4942, raw 29.1667
- Electrolyte Tablet Drink (electrolyte-tablet-drink) - calibrated 62.4942, raw 29.1667
- Kombucha (Unsweetened) (kombucha-unsweetened) - calibrated 62.4942, raw 29.1667

### B
- Protein Bar (Generic) (protein-bar-generic) - calibrated 54.4682, raw 27
- Apple Cider Vinegar (apple-cider-vinegar) - calibrated 44.2552, raw 25
- Coffee (coffee) - calibrated 44.2552, raw 25
- Diet Cola (diet-cola) - calibrated 44.2552, raw 25
- Raw Honey (raw-honey) - calibrated 44.2552, raw 25

### C
- Milk Chocolate Bar (milk-chocolate-bar) - calibrated 38.2607, raw 23.3333
- Jam (jam) - calibrated 33.0434, raw 20.8333
- Maple Syrup (maple-syrup) - calibrated 27.826, raw 18.3333
- Sports Drink (sports-drink) - calibrated 26.4349, raw 17.6667
- Barbecue Sauce (barbecue-sauce) - calibrated 24.3479, raw 16.6667

### D
- Ketchup (ketchup) - calibrated 17.1429, raw 12.5
- Processed Honey (processed-honey) - calibrated 17.1429, raw 12.5
- Regular Cola (cola-regular) - calibrated 17.1429, raw 12.5
- Sweetened Coffee Creamer (sweetened-coffee-creamer) - calibrated 15.2381, raw 11.1111
- Zero-Sugar Energy Drink (energy-drink-zero) - calibrated 11.4286, raw 8.3333

## nuts
- raw thresholds: S 49.8098-100 | A 42.7319-49.8097 | B 39.9475-42.7318 | C 29.7171-39.9474 | D 0-29.717
- calibration anchors: 0->0 | 29.7171->20 | 39.9475->40 | 42.7319->60 | 49.8098->80 | 100->100

### S
- Almonds (almonds) - calibrated 82.8001, raw 56.8367
- Hazelnuts (hazelnuts) - calibrated 82.2001, raw 55.3309
- Almond Butter (Unsweetened) (almond-butter-unsweetened) - calibrated 81.2365, raw 52.9128
- Peanuts (peanuts) - calibrated 81.1466, raw 52.6871
- Walnuts (walnuts) - calibrated 80.1571, raw 50.2041

### A
- Brazil Nuts (brazil-nuts) - calibrated 78.8861, raw 49.4156
- Pistachios (pistachios) - calibrated 69.4672, raw 46.0823
- Mixed Nuts (Unsalted) (mixed-nuts-unsalted) - calibrated 63.709, raw 44.0445
- Cashew Butter (cashew-butter) - calibrated 63.3612, raw 43.9214
- Cashews (cashews) - calibrated 60.7208, raw 42.987

### B
- Pistachios (Roasted & Salted) (pistachios-roasted-salted) - calibrated 58.1676, raw 42.4768
- Pine Nuts (pine-nuts) - calibrated 58.1231, raw 42.4706
- Hickory Nuts (hickory-nuts) - calibrated 47.44, raw 40.9833
- Peanut Butter (peanut-butter) - calibrated 46.1521, raw 40.804
- Mixed Nuts (Salted) (salted-mixed-nuts) - calibrated 42.0651, raw 40.235

### C
- Pecans (pecans) - calibrated 39.4378, raw 39.6599
- Honey-Roasted Peanuts (honey-roasted-peanuts) - calibrated 27.0394, raw 33.3179
- Acorns (acorns) - calibrated 25.528, raw 32.5448
- Macadamia Butter (macadamia-butter) - calibrated 24.3685, raw 31.9517
- Macadamia Nuts (macadamia) - calibrated 20.4381, raw 29.9412

### D
- Pili Nuts (pili-nuts) - calibrated 19.8491, raw 29.4929
- Trail Mix with Chocolate (trail-mix-chocolate) - calibrated 18.9838, raw 28.2071
- Chocolate-Covered Peanuts (chocolate-covered-peanuts) - calibrated 18.6341, raw 27.6876
- Candied Walnuts (candied-walnuts) - calibrated 17.0293, raw 25.303
- Chestnuts (chestnuts) - calibrated 16.2988, raw 24.2177

## oils-and-fats
- raw thresholds: S 50.625-100 | A 41.55-50.6249 | B 30.8167-41.5499 | C 27.1429-30.8166 | D 0-27.1428
- calibration anchors: 0->0 | 27.1429->20 | 30.8167->40 | 41.55->60 | 50.625->80 | 100->100

### S
- Olive Oil (Refined) (olive-oil-refined) - calibrated 81.6998, raw 54.8214
- Sunflower Oil (sunflower-oil) - calibrated 81.0488, raw 53.2143
- Safflower Oil (safflower-oil) - calibrated 80.5425, raw 51.9643
- Extra Virgin Olive Oil (extra-virgin-olive-oil) - calibrated 80.3101, raw 51.3905
- Walnut Oil (walnut-oil) - calibrated 80.2532, raw 51.25

### A
- Soybean Oil (soybean-oil) - calibrated 78.6226, raw 50
- Corn Oil (corn-oil) - calibrated 74.2936, raw 48.0357
- Canola Oil (canola-oil) - calibrated 70.0591, raw 46.1143
- Mayonnaise (mayonnaise) - calibrated 69.4398, raw 45.8333
- Macadamia Oil (macadamia-oil) - calibrated 66.8163, raw 44.6429

### B
- Avocado Oil (avocado-oil) - calibrated 54.2368, raw 38.4571
- Sesame Oil (sesame-oil) - calibrated 52.7461, raw 37.6571
- Flaxseed Oil (flaxseed-oil) - calibrated 52.3913, raw 37.4667
- Peanut Oil (peanut-oil) - calibrated 52.2138, raw 37.3714
- Schmaltz (schmaltz) - calibrated 40.0309, raw 30.8333

### C
- Palm Oil (palm-oil) - calibrated 39.9091, raw 30.8
- Bacon Grease (bacon-grease) - calibrated 38.1463, raw 30.4762
- Butter (butter) - calibrated 31.3022, raw 29.219
- Duck Fat (duck-fat) - calibrated 27.7767, raw 28.5714
- Lard (lard) - calibrated 27.7767, raw 28.5714

### D
- Beef Tallow (beef-tallow) - calibrated 18.9473, raw 25.7143
- Vegetable Shortening (vegetable-shortening) - calibrated 17.8947, raw 24.2857
- Coconut Oil (coconut-oil) - calibrated 17.5438, raw 23.8095
- Ghee (ghee) - calibrated 16.5473, raw 22.4571
- Margarine (margarine) - calibrated 14.3158, raw 19.4286

## seeds
- raw thresholds: S 54.0344-100 | A 52.9629-54.0343 | B 50.1428-52.9628 | C 39.7619-50.1427 | D 0-39.7618
- calibration anchors: 0->0 | 39.7619->20 | 50.1428->40 | 52.9629->60 | 54.0344->80 | 100->100

### S
- Flax Seeds (flax-seeds) - calibrated 82.6647, raw 60.1587
- Sunflower Seeds (sunflower-seeds) - calibrated 81.6978, raw 57.9365
- Chia Seeds (chia-seeds) - calibrated 81.3525, raw 57.1429
- Ground Flaxseed (ground-flax) - calibrated 80.8, raw 55.873
- Pumpkin Seed Butter (pumpkin-seed-butter) - calibrated 80.0979, raw 54.2593

### A
- Hemp Seeds (hemp-seeds) - calibrated 75.8021, raw 53.8095
- Coriander Seeds (coriander-seeds) - calibrated 73.8273, raw 53.7037
- Mustard Seeds (mustard-seeds) - calibrated 72.8399, raw 53.6508
- Sunflower Seeds (Roasted & Salted) (sunflower-seeds-roasted-salted) - calibrated 72.8399, raw 53.6508
- Pumpkin Seeds (Roasted & Salted) (pumpkin-seeds-roasted-salted) - calibrated 63.4568, raw 53.1481

### B
- Flax Crackers (flax-crackers) - calibrated 58.6873, raw 52.7778
- Caraway Seeds (caraway-seeds) - calibrated 41.239, raw 50.3175
- Poppy Seeds (poppy-seeds) - calibrated 41.239, raw 50.3175
- Pumpkin Seeds (pumpkin-seeds) - calibrated 41.239, raw 50.3175
- Sesame Seeds (sesame-seeds) - calibrated 41.0134, raw 50.2857

### C
- Fennel Seeds (fennel-seeds) - calibrated 39.7249, raw 50
- Watermelon Seeds (Unsalted) (watermelon-seeds-unsalted) - calibrated 32.0795, raw 46.0317
- Cumin Seeds (cumin-seeds) - calibrated 31.468, raw 45.7143
- Tahini (tahini) - calibrated 29.735, raw 44.8148
- Nigella Seeds (nigella-seeds) - calibrated 22.2936, raw 40.9524

### D
- Sunflower Seed Butter (sunflower-seed-butter) - calibrated 19.4012, raw 38.5714
- Watermelon Seeds (Roasted & Salted) (watermelon-seeds-roasted-salted) - calibrated 18.6188, raw 37.0159
- Chia Pudding (Sweetened) (sweetened-chia-pudding) - calibrated 14.2515, raw 28.3333
- Sesame Snaps (sesame-snaps) - calibrated 13.9721, raw 27.7778
- Sweetened Sunflower Spread (sweetened-sunflower-spread) - calibrated 12.5235, raw 24.898

## tubers
- raw thresholds: S 42.9603-100 | A 41.4841-42.9602 | B 37.3148-41.484 | C 28.0556-37.3147 | D 0-28.0555
- calibration anchors: 0->0 | 28.0556->20 | 37.3148->40 | 41.4841->60 | 42.9603->80 | 100->100

### S
- Sweet Potato (sweet-potato) - calibrated 83.0528, raw 51.6667
- Yam (yam) - calibrated 80.5816, raw 44.619
- Jicama (jicama) - calibrated 80.4647, raw 44.2857
- Ube (ube) - calibrated 80.2978, raw 43.8095
- White Potato (white-potato) - calibrated 80.0863, raw 43.2063

### A
- Purple Sweet Potato (purple-sweet-potato) - calibrated 76.6671, raw 42.7143
- Taro (taro) - calibrated 71.0757, raw 42.3016
- Instant Mashed Potatoes (instant-mashed-potatoes) - calibrated 70, raw 42.2222
- Parsnip (parsnip) - calibrated 61.6136, raw 41.6032
- Green Plantain (plantain-green) - calibrated 60.7533, raw 41.5397

### B
- Celeriac (celeriac) - calibrated 59.7338, raw 41.4286
- Daikon Radish (daikon-radish) - calibrated 52.8808, raw 40
- Turnip (turnip) - calibrated 43.1348, raw 37.9683
- Rutabaga (rutabaga) - calibrated 42.5256, raw 37.8413
- Jerusalem Artichoke (jerusalem-artichoke) - calibrated 42.221, raw 37.7778

### C
- Tapioca Pearls (tapioca-pearls-dry) - calibrated 39.0001, raw 36.8519
- Cassava (Boiled) (cassava-boiled) - calibrated 38.8057, raw 36.7619
- Beetroot (beetroot) - calibrated 38.2571, raw 36.5079
- Cassava (cassava) - calibrated 27.9028, raw 31.7143
- Potato Chips (potato-chips) - calibrated 25, raw 30.3704

### D
- Hash Browns (hash-browns) - calibrated 18.3498, raw 25.7407
- Taro Chips (taro-chips) - calibrated 17.0297, raw 23.8889
- Tater Tots (tater-tots) - calibrated 16.2376, raw 22.7778
- Cassava Chips (cassava-chips) - calibrated 15.1815, raw 21.2963
- Fries (fries) - calibrated 14.8797, raw 20.873

## vegetables
- raw thresholds: S 59.0774-100 | A 49.2064-59.0773 | B 46.6825-49.2063 | C 43.8095-46.6824 | D 0-43.8094
- calibration anchors: 0->0 | 43.8095->20 | 46.6825->40 | 49.2064->60 | 59.0774->80 | 100->100

### S
- Kale (kale) - calibrated 82.4873, raw 64.1667
- Spinach (spinach) - calibrated 81.3236, raw 61.7857
- Collard Greens (collard-greens) - calibrated 81.2267, raw 61.5873
- Brussels Sprouts (brussels-sprouts) - calibrated 80.0242, raw 59.127
- Swiss Chard (swiss-chard) - calibrated 80.0048, raw 59.0873

### A
- Watercress (watercress) - calibrated 79.9799, raw 59.0675
- Broccoli (broccoli) - calibrated 79.4572, raw 58.8095
- Romaine Lettuce (romaine-lettuce) - calibrated 66.1104, raw 52.2222
- Cabbage (cabbage) - calibrated 62.8943, raw 50.6349
- Red Bell Pepper (red-bell-pepper) - calibrated 60.6431, raw 49.5238

### B
- Carrots (carrots) - calibrated 57.4841, raw 48.8889
- Bok Choy (bok-choy) - calibrated 56.8549, raw 48.8095
- Asparagus (asparagus) - calibrated 54.0251, raw 48.4524
- Cauliflower (cauliflower) - calibrated 46.7927, raw 47.5397
- Green Beans (green-beans) - calibrated 40.7552, raw 46.7778

### C
- Tomato (tomato) - calibrated 39.3373, raw 46.5873
- Celery (celery) - calibrated 28.2875, raw 45
- Radish (radish) - calibrated 28.2875, raw 45
- Eggplant (eggplant) - calibrated 24.4198, raw 44.4444
- Zucchini (zucchini) - calibrated 23.315, raw 44.2857

### D
- Mushrooms (mushrooms) - calibrated 19.7826, raw 43.3333
- Cucumber (cucumber) - calibrated 19.2754, raw 42.2222
- Onion (onion) - calibrated 19.2754, raw 42.2222
- Pickles (pickled-cucumber) - calibrated 18.5145, raw 40.5556
- Iceberg Lettuce (iceberg-lettuce) - calibrated 16.8116, raw 36.8254
