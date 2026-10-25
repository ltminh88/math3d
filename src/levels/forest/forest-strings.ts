import type { defineStrings } from '../../i18n/i18n';

/**
 * Forest strings (vi source). `divSign` carries the division sign: `:` as in Vietnamese
 * textbooks (GDPT 2018), `÷` in English. Registered through `LevelContext.defineStrings` once.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('forest', {
    vi: {
      title: 'Rừng Nhân Chia',
      divSign: ':',
      mulSign: '×',
      intro:
        'Cơn bão thổi rơi hết trái cây của các bạn thú rồi. Mình cùng giúp các bạn chia lại thật đều nhé!',
      round: 'Lượt {n}/{total}',
      sharePrompt: 'Có {total} quả. Chia đều cho {groups} bạn thì mỗi bạn được mấy quả?',
      packPrompt: 'Bác Gấu xếp {total} quả vào giỏ, mỗi giỏ {size} quả. Xếp được mấy giỏ?',
      familyPrompt: 'Ba số {a}, {b} và {p} là một gia đình phép tính. Điền số còn thiếu nhé!',
      guideShare: 'Bấm vào một quả rồi bấm vào bạn thú, hoặc kéo quả sang. Chia đều nhé!',
      guidePack: 'Mỗi giỏ đựng vừa {size} quả. Đầy giỏ này thì có giỏ mới.',
      guideFamily: 'Phép nhân và phép chia là anh em đấy. Một phép nhân cho ta hai phép chia!',
      dealShare: 'Chia mỗi bạn một quả',
      dealPack: 'Xếp đầy một giỏ',
      check: 'Kiểm tra',
      hint: 'Gợi ý',
      next: 'Tiếp tục',
      answer: 'Câu trả lời',
      pileLeft: 'Còn {n} quả chưa chia.',
      equalShare: 'Chia đều rồi! Bạn nào cũng có số quả bằng nhau.',
      equalPack: 'Giỏ nào cũng đầy rồi!',
      unequal: 'Chưa đều đâu: ▲ là nhiều quá, ▼ là còn ít.',
      correct: 'Đúng rồi! {equation}',
      correctBlank: 'Đúng rồi! Điền tiếp nhé.',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      wrongClose: 'Gần đúng rồi, mình thử lại nhé!',
      revealed: 'Mình cùng xem nhé: {equation}',
      hint1: 'Đếm lại số quả và số bạn nhé. Bạn làm được mà!',
      hint2: 'Xem nè: chia lần lượt mỗi bạn một quả, đến khi hết quả.',
      hint2Pack: 'Xem nè: xếp lần lượt từng giỏ {size} quả, đến khi hết quả.',
      hint2Family: 'Xem nè: {p} quả chia thành {a} nhóm, mỗi nhóm {b} quả.',
      hint3: 'Đếm thêm {step}: {sequence}',
      hint4: 'Nhớ phép nhân nhé: ? {mul} {divisor} = {dividend}',
      animalCount: '{name}: {count} quả',
      basketCount: 'Giỏ {n}: {count} quả',
      pile: 'Đống quả',
      rabbit: 'Thỏ',
      squirrel: 'Sóc',
      bear: 'Gấu',
      fox: 'Cáo',
      hedgehog: 'Nhím',
      doneTitle: 'Rừng đã vui trở lại!',
      doneLine: 'Cảm ơn bạn đã giúp các bạn thú chia trái cây thật đều. Giỏi lắm!',
      doneScore: '+{xp} XP · +{coins} xu',
      bonusLine: 'Thưởng lần đầu hoàn thành: +{xp} XP · +{coins} xu',
      backToGate: 'Về cổng',
      keysHelp: 'Phím mũi tên chọn quả, Enter để đặt. Gõ số rồi Enter để trả lời.',
      reward: '+{xp} XP',
    },
    en: {
      title: 'Multiplication Forest',
      divSign: '÷',
      mulSign: '×',
      intro: 'The storm knocked down all the animals’ fruit. Let’s help them share it fairly!',
      round: 'Round {n}/{total}',
      sharePrompt: '{total} fruit shared equally among {groups} friends. How many does each get?',
      packPrompt: 'Bear packs {total} fruit into baskets of {size}. How many baskets?',
      familyPrompt: '{a}, {b} and {p} are a fact family. Fill in the missing numbers!',
      guideShare: 'Tap a fruit, then tap a friend, or drag it over. Share it fairly!',
      guidePack: 'Each basket holds exactly {size}. A full basket brings a new one.',
      guideFamily: 'Multiplying and dividing are siblings. One multiplication gives two divisions!',
      dealShare: 'Give each friend one',
      dealPack: 'Fill one basket',
      check: 'Check',
      hint: 'Hint',
      next: 'Next',
      answer: 'Answer',
      pileLeft: '{n} fruit still to share.',
      equalShare: 'Fair share! Every friend has the same.',
      equalPack: 'Every basket is full!',
      unequal: 'Not fair yet: ▲ has too many, ▼ needs more.',
      correct: 'Right! {equation}',
      correctBlank: 'Right! Keep going.',
      wrong: 'Not yet, let’s try again!',
      wrongClose: 'Almost! Let’s try again.',
      revealed: 'Let’s look together: {equation}',
      hint1: 'Count the fruit and the friends again. You can do it!',
      hint2: 'Watch: give each friend one fruit at a time until none are left.',
      hint2Pack: 'Watch: fill one basket of {size} at a time until none are left.',
      hint2Family: 'Watch: {p} fruit in {a} groups, {b} in each group.',
      hint3: 'Count by {step}: {sequence}',
      hint4: 'Think multiplication: ? {mul} {divisor} = {dividend}',
      animalCount: '{name}: {count} fruit',
      basketCount: 'Basket {n}: {count} fruit',
      pile: 'Fruit pile',
      rabbit: 'Rabbit',
      squirrel: 'Squirrel',
      bear: 'Bear',
      fox: 'Fox',
      hedgehog: 'Hedgehog',
      doneTitle: 'The forest is happy again!',
      doneLine: 'Thank you for helping the animals share their fruit fairly. Well done!',
      doneScore: '+{xp} XP · +{coins} coins',
      bonusLine: 'First-clear bonus: +{xp} XP · +{coins} coins',
      backToGate: 'Back to the gate',
      keysHelp: 'Arrow keys pick a fruit, Enter places it. Type a number and Enter to answer.',
      reward: '+{xp} XP',
    },
  });

export type ForestStrings = ReturnType<typeof define>;
let cached: ForestStrings | undefined;

/** The forest translator (namespace registered on first use, reused by later runs). */
export function forestStrings(defineFn: typeof defineStrings): ForestStrings {
  cached ??= define(defineFn);
  return cached;
}

export const ANIMAL_NAME_KEYS = ['rabbit', 'squirrel', 'fox', 'hedgehog', 'bear'] as const;
