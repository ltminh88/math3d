import { defineStrings } from '../i18n/i18n';

/** Quest chain after the bridge (vi source; gate names come from the level host strings). */
export const tq = defineStrings('questChain', {
  vi: {
    eyebrowNext: 'NHIỆM VỤ TIẾP THEO',
    eyebrowDone: 'CHÚC MỪNG BẠN',
    titleField: 'Cánh Đồng Phép Tính',
    titleForest: 'Rừng Nhân Chia',
    titleCity: 'Thành Phố Con Số',
    titleTower: 'Tháp Toán Học',
    titleGarden: 'Khu Vườn Quy Luật',
    titleValley: 'Thung Lũng Hình Học',
    titleWorkshop: 'Xưởng Đo Đạc',
    titleCave: 'Hang Đố Vui',
    titleDone: 'Bạn đã qua cả chín chặng!',
    copyField:
      'Đi theo con đường bên kia cầu tới cánh đồng lúa vàng. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyForest:
      'Cổng mới đã mở! Đi theo con đường bên kia cầu tới khu rừng xanh. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyCity:
      'Cổng mới đã mở! Đi theo con đường bên kia cầu tới thành phố của những tòa nhà mang số. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyTower:
      'Chặng cuối đã mở! Đi theo con đường bên kia cầu tới ngọn tháp cao nhất. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyGarden:
      'Chương 2 đã mở! Quay lại khu vườn ngay bên kia cầu. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyValley:
      'Cổng mới đã mở! Đi theo con đường mới về phía bắc, giữa cánh đồng và ngọn tháp. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyWorkshop:
      'Cổng mới đã mở! Đi theo con đường mới về phía nam, giữa khu rừng và thành phố. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyCave:
      'Chặng cuối đã mở! Về làng rồi đi theo con đường qua chòi nghỉ tới hang đá. Tìm cổng có dấu ✨ {gate}, {enter}',
    copyComingSoon: '{gate} sắp ra mắt. Trong lúc chờ, bạn luyện thêm cùng {guide} nhé!',
    enterKeyOrTap: 'rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    enterTap: 'rồi bấm nút Vào cổng nhé!',
    copyDone: 'Bạn có thể luyện thêm cùng {guide}, hoặc ghé {shop} trong làng để tiêu xu.',
    progressField: 'Đến Cổng Cánh Đồng',
    progressForest: 'Đến Cổng Rừng Nhân Chia',
    progressCity: 'Đến Cổng Thành Phố Con Số',
    progressTower: 'Đến Cổng Tháp Toán Học',
    progressGarden: 'Đến Cổng Khu Vườn',
    progressValley: 'Đến Cổng Thung Lũng',
    progressWorkshop: 'Đến Cổng Xưởng Đo Đạc',
    progressCave: 'Đến Cổng Hang Đố Vui',
    progressComingSoon: 'Sắp ra mắt',
    progressDone: '✓ Hoàn thành',
    rewardLevel: '+{xp} XP, +{coins} xu',
    rewardPractice: '+10 XP / câu',
    stepBridge: 'Cây cầu',
    stepField: 'Cánh Đồng',
    stepForest: 'Khu Rừng',
    stepCity: 'Thành Phố',
    stepTower: 'Tháp',
    stepGarden: 'Khu Vườn',
    stepValley: 'Thung Lũng',
    stepWorkshop: 'Xưởng',
    stepCave: 'Hang',
    chapterLabel: 'Chương {n} · {k}/{m}',
    stepDone: 'Chặng {n}: {name}, đã xong',
    stepTodo: 'Chặng {n}: {name}, chưa xong',
    guideField:
      '{gate} đang chờ bạn ở cuối con đường bên kia cầu. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideForest:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, phía khu rừng xanh. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideCity:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, phía thành phố con số. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideTower:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, dưới chân ngọn tháp cao nhất. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideGarden:
      '{gate} đã mở! Cổng ở ngay khu vườn bên kia cầu. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideValley:
      '{gate} đã mở! Cổng ở cuối con đường mới phía bắc, giữa cánh đồng và ngọn tháp. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideWorkshop:
      '{gate} đã mở! Cổng ở cuối con đường mới phía nam, giữa khu rừng và thành phố. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideCave:
      '{gate} đã mở! Cổng ở hang đá bên bờ làng, cuối con đường qua chòi nghỉ. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideComingSoon:
      '{gate} sắp ra mắt đấy! Trong lúc chờ, bạn luyện thêm phép nhân cùng mình nhé?',
    completeNote:
      '✨ {gate} đã mở! Cổng ở cuối con đường bên kia cầu, phía cánh đồng lúa vàng. Nhấn M để xem bản đồ nhé!',
    completeNoteTouch:
      '✨ {gate} đã mở! Cổng ở cuối con đường bên kia cầu, phía cánh đồng lúa vàng. Chạm bản đồ nhỏ ở góc màn hình để xem bản đồ nhé!',
  },
  en: {
    eyebrowNext: 'NEXT QUEST',
    eyebrowDone: 'WELL DONE',
    titleField: 'Math Meadow',
    titleForest: 'Sharing Forest',
    titleCity: 'Number City',
    titleTower: 'Math Tower',
    titleGarden: 'Pattern Garden',
    titleValley: 'Geometry Valley',
    titleWorkshop: 'Measuring Workshop',
    titleCave: 'Puzzle Cave',
    titleDone: 'You finished all nine stages!',
    copyField:
      'Follow the road across the bridge to the golden meadow. Find the ✨ {gate}, {enter}',
    copyForest:
      'A new gate is open! Follow the road across the bridge to the green forest. Find the ✨ {gate}, {enter}',
    copyCity:
      'A new gate is open! Follow the road across the bridge to the city of numbered buildings. Find the ✨ {gate}, {enter}',
    copyTower:
      'The last stage is open! Follow the road across the bridge to the tallest tower. Find the ✨ {gate}, {enter}',
    copyGarden:
      'Chapter 2 is open! Go back to the garden just across the bridge. Find the ✨ {gate}, {enter}',
    copyValley:
      'A new gate is open! Follow the new road north, between the meadow and the tower. Find the ✨ {gate}, {enter}',
    copyWorkshop:
      'A new gate is open! Follow the new road south, between the forest and the city. Find the ✨ {gate}, {enter}',
    copyCave:
      'The last stage is open! Go back to the village and follow the road past the gazebo to the cave. Find the ✨ {gate}, {enter}',
    copyComingSoon: 'The {gate} is coming soon. Meanwhile, practise more with {guide}!',
    enterKeyOrTap: 'then press E or tap Enter to go in!',
    enterTap: 'then tap Enter to go in!',
    copyDone: 'Practise more with {guide}, or visit the {shop} in the village to spend your coins.',
    progressField: 'Reach the Meadow Gate',
    progressForest: 'Reach the Forest Gate',
    progressCity: 'Reach the City Gate',
    progressTower: 'Reach the Tower Gate',
    progressGarden: 'Reach the Garden Gate',
    progressValley: 'Reach the Valley Gate',
    progressWorkshop: 'Reach the Workshop Gate',
    progressCave: 'Reach the Cave Gate',
    progressComingSoon: 'Coming soon',
    progressDone: '✓ Complete',
    rewardLevel: '+{xp} XP, +{coins} coins',
    rewardPractice: '+10 XP / answer',
    stepBridge: 'Bridge',
    stepField: 'Meadow',
    stepForest: 'Forest',
    stepCity: 'City',
    stepTower: 'Tower',
    stepGarden: 'Garden',
    stepValley: 'Valley',
    stepWorkshop: 'Workshop',
    stepCave: 'Cave',
    chapterLabel: 'Chapter {n} · {k}/{m}',
    stepDone: 'Stage {n}: {name}, done',
    stepTodo: 'Stage {n}: {name}, not done yet',
    guideField:
      'The {gate} is waiting for you at the end of the road across the bridge. We can also practise multiplication together!',
    guideForest:
      'The {gate} is open! It is waiting at the end of the road across the bridge, by the green forest. We can also practise multiplication together!',
    guideCity:
      'The {gate} is open! It is waiting at the end of the road across the bridge, by Number City. We can also practise multiplication together!',
    guideTower:
      'The {gate} is open! It is waiting at the end of the road across the bridge, at the foot of the tallest tower. We can also practise multiplication together!',
    guideGarden:
      'The {gate} is open! It stands in the garden just across the bridge. We can also practise multiplication together!',
    guideValley:
      'The {gate} is open! It stands at the end of the new road north, between the meadow and the tower. We can also practise multiplication together!',
    guideWorkshop:
      'The {gate} is open! It stands at the end of the new road south, between the forest and the city. We can also practise multiplication together!',
    guideCave:
      'The {gate} is open! It stands by the cave on the village bank, at the end of the road past the gazebo. We can also practise multiplication together!',
    guideComingSoon:
      'The {gate} is coming soon! Meanwhile, shall we practise multiplication together?',
    completeNote:
      '✨ The {gate} is open! It stands at the end of the road across the bridge, by the golden meadow. Press M to see the map!',
    completeNoteTouch:
      '✨ The {gate} is open! It stands at the end of the road across the bridge, by the golden meadow. Tap the minimap in the corner to see the map!',
  },
});
