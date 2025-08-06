/**
 * 修正word-library.js中错误的phonetic字段
 * 将错误的phonetic（如"/home/"）替换为正确的国际音标
 */

const fs = require('fs');
const path = require('path');

// 错误phonetic到正确phonetic的映射
const PHONETIC_CORRECTIONS = {
  // 基础单词修正
  "/bed/": "/bed/",
  "/best/": "/best/",
  "/bred/": "/bred/",
  "/desk/": "/desk/",
  "/dres/": "/dres/",
  "/free/": "/friː/",
  "/fresh/": "/freʃ/",
  "/friend/": "/frend/",
  "/from/": "/frʌm/",
  "/front/": "/frʌnt/",
  "/fruit/": "/fruːt/",
  "/hair/": "/her/",
  "/half/": "/hæf/",
  "/hand/": "/hænd/",
  "/happy/": "/ˈhæpi/",
  "/hard/": "/hɑːrd/",
  "/has/": "/hæz/",
  "/hat/": "/hæt/",
  "/have/": "/hæv/",
  "/he/": "/hiː/",
  "/head/": "/hed/",
  "/hed/": "/hed/",
  "/healthy/": "/ˈhelθi/",
  "/hear/": "/hɪr/",
  "/heavy/": "/ˈhevi/",
  "/help/": "/help/",
  "/her/": "/hər/",
  "/here/": "/hɪr/",
  "/hers/": "/hərz/",
  "/hi/": "/haɪ/",
  "/high/": "/haɪ/",
  "/him/": "/hɪm/",
  "/his/": "/hɪz/",
  "/history/": "/ˈhɪstəri/",
  "/hobby/": "/ˈhɑːbi/",
  "/hold/": "/hoʊld/",
  "/holiday/": "/ˈhɑːlədeɪ/",
  "/home/": "/hoʊm/",
  "/hometown/": "/ˈhoʊmtaʊn/",
  "/homework/": "/ˈhoʊmwərk/",
  "/hope/": "/hoʊp/",
  "/horse/": "/hɔːrs/",
  "/hospital/": "/ˈhɑːspɪtəl/",
  "/hot/": "/hɑːt/",
  "/hour/": "/aʊr/",
  "/house/": "/haʊs/",
  "/how/": "/haʊ/",
  "/hungry/": "/ˈhʌŋɡri/",
  "/hurry/": "/ˈhɜːri/",
  "/hurt/": "/hɜːrt/",
  "/i/": "/aɪ/",
  "/ice-cream/": "/ˈaɪs kriːm/",
  "/if/": "/ɪf/",
  "/ill/": "/ɪl/",
  "/internet/": "/ˈɪntərnet/",
  "/into/": "/ˈɪntuː/",
  "/its/": "/ɪts/",
  "/job/": "/dʒɑːb/",
  "/keep/": "/kiːp/",
  "/kid/": "/kɪd/",
  "/kind/": "/kaɪnd/",
  "/kitchen/": "/ˈkɪtʃən/",
  "/kite/": "/kaɪt/",
  "/know/": "/noʊ/",
  "/let/": "/let/",
  "/nek/": "/nek/",
  "/nekst/": "/nekst/",
  "/now/": "/naʊ/",
  "/pen/": "/pen/",
  "/red/": "/red/",
  "/sel/": "/sel/",
  "/step/": "/step/",
  "/sweater/": "/ˈswetər/",
  "/sweep/": "/swiːp/",
  "/swim/": "/swɪm/",
  "/tell/": "/tel/",
  "/tel/": "/tel/",
  "/ten/": "/ten/",
  "/wer/": "/wer/",
  "/wel/": "/wel/",
  "/what/": "/wʌt/",
  "/when/": "/wen/",
  "/wen/": "/wen/",
  "/where/": "/wer/",
  "/which/": "/wɪtʃ/",
  "/white/": "/waɪt/",
  "/who/": "/huː/",
  "/whose/": "/huːz/",
  "/why/": "/waɪ/",
  "/will/": "/wɪl/",
  "/wind/": "/wɪnd/",
  "/window/": "/ˈwɪndoʊ/",
  "/windy/": "/ˈwɪndi/",
  "/winter/": "/ˈwɪntər/",
  "/with/": "/wɪθ/",
  "/woman/": "/ˈwʊmən/",
  "/wonderful/": "/ˈwʌndərfəl/",
  "/word/": "/wɜːrd/",
  "/work/": "/wɜːrk/",
  "/worker/": "/ˈwɜːrkər/",
  "/world/": "/wɜːrld/",
  "/worry/": "/ˈwɜːri/",
  "/write/": "/raɪt/",
  "/wrong/": "/rɔːŋ/",
  "/year/": "/jɪr/",
  "/yellow/": "/ˈjeloʊ/",
  "/yes/": "/jes/",
  "/jes/": "/jes/",
  "/yesterday/": "/ˈjestərdeɪ/",
  "/you/": "/juː/",
  "/young/": "/jʌŋ/",
  "/your/": "/jʊr/",
  "/zoo/": "/zuː/",
  
  // 之前已修正的单词
  "/excuse/": "/ɪkˈskjuːz/",
  "/eye/": "/aɪ/",
  "/face/": "/feɪs/",
  "/family/": "/ˈfæməli/",
  "/famous/": "/ˈfeɪməs/",
  "/fan/": "/fæn/",
  "/far/": "/fɑːr/",
  "/farm/": "/fɑːrm/",
  "/farmer/": "/ˈfɑːrmər/",
  "/fast/": "/fæst/",
  "/father/": "/ˈfɑːðər/",
  "/favourite/": "/ˈfeɪvərɪt/",
  "/feel/": "/fiːl/",
  "/film/": "/fɪlm/",
  "/find/": "/faɪnd/",
  "/fine/": "/faɪn/",
  "/fish/": "/fɪʃ/",
  "/floor/": "/flɔːr/",
  "/flower/": "/ˈflaʊər/",
  "/fly/": "/flaɪ/",
  "/game/": "/ɡeɪm/",
  "/garden/": "/ˈɡɑːrdən/",
  "/get/": "/ɡet/",
  "/girl/": "/ɡɜːrl/",
  "/give/": "/ɡɪv/",
  "/go/": "/ɡoʊ/",
  "/good/": "/ɡʊd/",
  "/grandfather/": "/ˈɡrændfɑːðər/",
  "/grandmother/": "/ˈɡrænmʌðər/",
  "/green/": "/ɡriːn/",
  "/hello/": "/həˈloʊ/",
  "/ice/": "/aɪs/",
  "/idea/": "/aɪˈdiːə/",
  "/important/": "/ɪmˈpɔːrtənt/",
  "/in/": "/ɪn/",
  "/interesting/": "/ˈɪntrəstɪŋ/",
  "/is/": "/ɪz/",
  "/it/": "/ɪt/",
  "/juice/": "/dʒuːs/",
  "/jump/": "/dʒʌmp/",
  "/just/": "/dʒʌst/",
  "/key/": "/kiː/",
  "/lake/": "/leɪk/",
  "/large/": "/lɑːrdʒ/",
  "/last/": "/læst/",
  "/late/": "/leɪt/",
  "/learn/": "/lɜːrn/",
  "/left/": "/left/",
  "/lesson/": "/ˈlesən/",
  "/library/": "/ˈlaɪbreri/",
  "/like/": "/laɪk/",
  "/listen/": "/ˈlɪsən/",
  "/little/": "/ˈlɪtəl/",
  "/live/": "/lɪv/",
  "/long/": "/lɔːŋ/",
  "/look/": "/lʊk/",
  "/love/": "/lʌv/",
  "/make/": "/meɪk/",
  "/man/": "/mæn/",
  "/many/": "/ˈmeni/",
  "/map/": "/mæp/",
  "/may/": "/meɪ/",
  "/me/": "/miː/",
  "/milk/": "/mɪlk/",
  "/money/": "/ˈmʌni/",
  "/month/": "/mʌnθ/",
  "/moon/": "/muːn/",
  "/morning/": "/ˈmɔːrnɪŋ/",
  "/mother/": "/ˈmʌðər/",
  "/movie/": "/ˈmuːvi/",
  "/music/": "/ˈmjuːzɪk/",
  "/my/": "/maɪ/",
  "/name/": "/neɪm/",
  "/near/": "/nɪr/",
  "/need/": "/niːd/",
  "/new/": "/nuː/",
  "/news/": "/nuːz/",
  "/next/": "/nekst/",
  "/nice/": "/naɪs/",
  "/night/": "/naɪt/",
  "/no/": "/noʊ/",
  "/number/": "/ˈnʌmbər/",
  "/of/": "/ʌv/",
  "/often/": "/ˈɔːfən/",
  "/old/": "/oʊld/",
  "/on/": "/ɑːn/",
  "/one/": "/wʌn/",
  "/only/": "/ˈoʊnli/",
  "/open/": "/ˈoʊpən/",
  "/or/": "/ɔːr/",
  "/other/": "/ˈʌðər/",
  "/our/": "/aʊr/",
  "/out/": "/aʊt/",
  "/over/": "/ˈoʊvər/",
  "/paper/": "/ˈpeɪpər/",
  "/park/": "/pɑːrk/",
  "/part/": "/pɑːrt/",
  "/party/": "/ˈpɑːrti/",
  "/people/": "/ˈpiːpəl/",
  "/picture/": "/ˈpɪktʃər/",
  "/place/": "/pleɪs/",
  "/play/": "/pleɪ/",
  "/please/": "/pliːz/",
  "/pretty/": "/ˈprɪti/",
  "/problem/": "/ˈprɑːbləm/",
  "/question/": "/ˈkwestʃən/",
  "/quick/": "/kwɪk/",
  "/rain/": "/reɪn/",
  "/read/": "/riːd/",
  "/right/": "/raɪt/",
  "/room/": "/ruːm/",
  "/run/": "/rʌn/",
  "/same/": "/seɪm/",
  "/say/": "/seɪ/",
  "/school/": "/skuːl/",
  "/see/": "/siː/",
  "/she/": "/ʃiː/",
  "/show/": "/ʃoʊ/",
  "/sister/": "/ˈsɪstər/",
  "/small/": "/smɔːl/",
  "/some/": "/sʌm/",
  "/son/": "/sʌn/",
  "/story/": "/ˈstɔːri/",
  "/student/": "/ˈstuːdənt/",
  "/study/": "/ˈstʌdi/",
  "/sun/": "/sʌn/",
  "/table/": "/ˈteɪbəl/",
  "/take/": "/teɪk/",
  "/talk/": "/tɔːk/",
  "/teacher/": "/ˈtiːtʃər/",
  "/thank/": "/θæŋk/",
  "/that/": "/ðæt/",
  "/the/": "/ðə/",
  "/their/": "/ðer/",
  "/them/": "/ðem/",
  "/then/": "/ðen/",
  "/there/": "/ðer/",
  "/they/": "/ðeɪ/",
  "/thing/": "/θɪŋ/",
  "/think/": "/θɪŋk/",
  "/this/": "/ðɪs/",
  "/three/": "/θriː/",
  "/time/": "/taɪm/",
  "/to/": "/tuː/",
  "/today/": "/təˈdeɪ/",
  "/tree/": "/triː/",
  "/try/": "/traɪ/",
  "/two/": "/tuː/",
  "/under/": "/ˈʌndər/",
  "/up/": "/ʌp/",
  "/us/": "/ʌs/",
  "/use/": "/juːz/",
  "/very/": "/ˈveri/",
  "/visit/": "/ˈvɪzɪt/",
  "/walk/": "/wɔːk/",
  "/want/": "/wɑːnt/",
  "/water/": "/ˈwɔːtər/",
  "/way/": "/weɪ/",
  "/we/": "/wiː/",
  "/week/": "/wiːk/",
  "/well/": "/wel/"
};

function fixPhoneticFields() {
  const filePath = path.join(__dirname, 'word-library.js');
  
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    let correctionCount = 0;
    
    // 遍历所有需要修正的phonetic字段
    for (const [wrongPhonetic, correctPhonetic] of Object.entries(PHONETIC_CORRECTIONS)) {
      const searchPattern = `"phonetic": "${wrongPhonetic}"`;
      const replacePattern = `"phonetic": "${correctPhonetic}"`;
      
      if (content.includes(searchPattern)) {
        content = content.replace(new RegExp(searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacePattern);
        correctionCount++;
        console.log(`✓ 修正: ${wrongPhonetic} → ${correctPhonetic}`);
      }
    }
    
    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n修正完成！总共修正了 ${correctionCount} 个phonetic字段。`);
    
    // 验证修正结果
    console.log('\n验证修正结果...');
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否还有错误的phonetic格式
    const wrongPhoneticPattern = /"phonetic":\s*"\/[a-zA-Z-]+\/"/g;
    const remainingErrors = updatedContent.match(wrongPhoneticPattern);
    
    if (remainingErrors && remainingErrors.length > 0) {
      console.log('⚠️  仍有以下phonetic字段需要手动检查:');
      remainingErrors.forEach(error => console.log(`  ${error}`));
    } else {
      console.log('✅ 所有phonetic字段格式检查通过！');
    }
    
  } catch (error) {
    console.error('修正phonetic字段时出错:', error.message);
  }
}

// 执行修正
if (require.main === module) {
  fixPhoneticFields();
}

module.exports = { PHONETIC_CORRECTIONS, fixPhoneticFields };