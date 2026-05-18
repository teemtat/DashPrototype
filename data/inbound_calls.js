//  SunSystem — Inbound Call Data
//  Each call object contains:
//    id            — unique call identifier
//    caller        — caller phone number
//    line          — client line that received the call
//    date          — display date (e.g. "14 May 2026")
//    time          — call start time (HH:MM)
//    duration      — call duration string
//    connection    — "connected" | "noanswer" | "transferred" | "busy"
//    intent        — intent tag code (null if no answer)
//    intentLabel   — human-readable Thai description of the intent
//    intentCategory — used for CSS color: "ekyc" | "ndid" | "dipchip" | "inquiry" | "faq"
//    resolution    — "resolved" | "transferred" | "pending" | "escalated" | null
//    resolutionLabel — Thai description of the resolution
//    linkedTask    — task ID linked to this call (null if none)
//    linkedTaskName — display name of the linked task
//    transcript    — array of { speaker, text, time }
//                    speaker: "bot" = aunjai AI, "customer" = caller

const INBOUND_CALLS = {
  calls: [

    // ── CALL-001 ─────────────────────────────────────────
    {
      id: "CALL-001",
      caller: "+66 81 234 5678",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "09:12",
      duration: "2m 14s",
      connection: "connected",
      intent: "TAG_PROBLEM_OPENACCOUNT",
      intentLabel: "สมัครเปิดบัญชีเงินฝากไม่ผ่าน",
      intentCategory: "ekyc",
      resolution: "transferred",
      resolutionLabel: "โอนสายให้เจ้าหน้าที่ต่อ",
      linkedTask: "ORD-2341",
      linkedTaskName: "Account Opening Campaign",
      transcript: [
        { speaker: "bot",      time: "09:12:05", text: "สวัสดีครับ ผมออมใจ ผู้ช่วย AI ของ AIS ยินดีให้บริการครับ วันนี้โทรมาเรื่องอะไรครับ?" },
        { speaker: "customer", time: "09:12:14", text: "สวัสดีค่ะ หนูพยายามสมัครเปิดบัญชีเงินฝากผ่านแอปแล้วมันไม่ผ่านค่ะ ขึ้นว่า 'ไม่สามารถดำเนินการได้ในขณะนี้'" },
        { speaker: "bot",      time: "09:12:22", text: "ขอโทษที่เกิดความไม่สะดวกนะครับ ขอทราบได้ไหมครับว่าทำขั้นตอนไหนแล้วเจอข้อความนี้ครับ?" },
        { speaker: "customer", time: "09:12:35", text: "ทำถึงขั้นตอนยืนยันตัวตนค่ะ พอกดยืนยันแล้วระบบก็ขึ้น error เลยค่ะ" },
        { speaker: "bot",      time: "09:12:48", text: "เข้าใจแล้วครับ กรณีนี้อาจเกี่ยวกับข้อมูลยืนยันตัวตนครับ ขอโอนสายให้เจ้าหน้าที่ดูแลต่อโดยตรงนะครับ กรุณารอสักครู่ครับ" }
      ]
    },

    // ── CALL-002 ─────────────────────────────────────────
    {
      id: "CALL-002",
      caller: "+66 89 876 5432",
      line: "AIS Line 2",
      date: "14 May 2026",
      time: "09:30",
      duration: "0m 48s",
      connection: "noanswer",
      intent: null,
      intentLabel: null,
      intentCategory: null,
      resolution: null,
      resolutionLabel: null,
      linkedTask: null,
      linkedTaskName: null,
      transcript: []
    },

    // ── CALL-003 ─────────────────────────────────────────
    {
      id: "CALL-003",
      caller: "+66 92 111 2233",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "10:05",
      duration: "3m 02s",
      connection: "connected",
      intent: "TAG_PROBLEM_NDID",
      intentLabel: "ยืนยันตัวตนผ่าน NDID ไม่สำเร็จ",
      intentCategory: "ndid",
      resolution: "resolved",
      resolutionLabel: "แก้ไขสำเร็จในสาย",
      linkedTask: "ORD-2341",
      linkedTaskName: "Account Opening Campaign",
      transcript: [
        { speaker: "bot",      time: "10:05:03", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ วันนี้มีเรื่องอะไรให้ช่วยครับ?" },
        { speaker: "customer", time: "10:05:12", text: "ผมลองยืนยันตัวตนผ่าน NDID แล้วระบบแจ้งว่า 'ยืนยันตัวตน NDID ไม่สำเร็จ' ครับ ทำซ้ำสองรอบแล้วยังเป็นเหมือนเดิม" },
        { speaker: "bot",      time: "10:05:24", text: "ขอโทษที่เกิดปัญหานะครับ ขอทราบได้ไหมครับว่าใช้แอปธนาคารไหนในการยืนยัน NDID ครับ?" },
        { speaker: "customer", time: "10:05:38", text: "ใช้แอป Krungthai NEXT ครับ" },
        { speaker: "bot",      time: "10:05:47", text: "เข้าใจแล้วครับ ลองอัปเดตแอป Krungthai NEXT เป็นเวอร์ชันล่าสุดก่อนนะครับ แล้วลองยืนยันใหม่อีกครั้งครับ ถ้ายังไม่ผ่านสามารถโทรกลับมาได้เลยครับ" },
        { speaker: "customer", time: "10:06:05", text: "โอเคครับ ลองดูนะครับ ขอบคุณครับ" }
      ]
    },

    // ── CALL-004 ─────────────────────────────────────────
    {
      id: "CALL-004",
      caller: "+66 85 444 9900",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "10:44",
      duration: "1m 37s",
      connection: "connected",
      intent: "TAG_FACESCAN_PROBLEM",
      intentLabel: "สแกนใบหน้าไม่ผ่าน / เกินจำนวนครั้ง",
      intentCategory: "ekyc",
      resolution: "pending",
      resolutionLabel: "บันทึก Case รอติดตาม",
      linkedTask: "ORD-2341",
      linkedTaskName: "Account Opening Campaign",
      transcript: [
        { speaker: "bot",      time: "10:44:01", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "10:44:10", text: "หนูสแกนใบหน้าแล้วขึ้นว่าสแกนไม่สำเร็จตลอดเลยค่ะ ลองหลายครั้งแล้วค่ะ" },
        { speaker: "bot",      time: "10:44:20", text: "ขอโทษนะครับ สแกนในสภาพแสงที่สว่างเพียงพอหรือเปล่าครับ และอย่าใส่แว่นหรือหมวกขณะสแกนนะครับ" },
        { speaker: "customer", time: "10:44:35", text: "ลองทำตามแล้วค่ะ ยังไม่ผ่านอยู่ดีค่ะ" },
        { speaker: "bot",      time: "10:44:45", text: "เข้าใจครับ ขอบันทึก Case ไว้ให้นะครับ เจ้าหน้าที่จะติดต่อกลับภายใน 1 วันทำการครับ" }
      ]
    },

    // ── CALL-005 ─────────────────────────────────────────
    {
      id: "CALL-005",
      caller: "+66 61 555 0011",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "11:17",
      duration: "1m 52s",
      connection: "connected",
      intent: "TAG_INQUIRY_ACCOUNT",
      intentLabel: "สอบถามข้อมูลบัญชีออมทรัพย์ / สินเชื่อ",
      intentCategory: "inquiry",
      resolution: "resolved",
      resolutionLabel: "แก้ไขสำเร็จในสาย",
      linkedTask: null,
      linkedTaskName: null,
      transcript: [
        { speaker: "bot",      time: "11:17:08", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "11:17:17", text: "อยากสอบถามว่าบัญชีออมทรัพย์ตอนนี้ดอกเบี้ยเท่าไหร่ครับ?" },
        { speaker: "bot",      time: "11:17:26", text: "บัญชีออมทรัพย์ปัจจุบันอัตราดอกเบี้ย 0.5% ต่อปีครับ หากสนใจผลตอบแทนที่สูงขึ้น มีบัญชีฝากประจำให้เลือกด้วยครับ" },
        { speaker: "customer", time: "11:17:42", text: "โอเคครับ ขอบคุณครับ" }
      ]
    },

    // ── CALL-006 ─────────────────────────────────────────
    {
      id: "CALL-006",
      caller: "+66 94 321 0099",
      line: "AIS Line 2",
      date: "14 May 2026",
      time: "11:45",
      duration: "2m 30s",
      connection: "connected",
      intent: "DIPCHIP_SEARCHLOC",
      intentLabel: "หาสถานที่จดบริการ Dipchip",
      intentCategory: "dipchip",
      resolution: "resolved",
      resolutionLabel: "แก้ไขสำเร็จในสาย",
      linkedTask: null,
      linkedTaskName: null,
      transcript: [
        { speaker: "bot",      time: "11:45:10", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "11:45:20", text: "อยากจะไปจดทะเบียน Dipchip ครับ ไม่รู้ว่าต้องไปที่ไหนครับ" },
        { speaker: "bot",      time: "11:45:30", text: "สามารถไปจดที่สาขา AIS ทุกสาขาทั่วประเทศได้เลยครับ หรือเช็กจุดใกล้บ้านได้ที่แอป AIS ครับ" },
        { speaker: "customer", time: "11:45:48", text: "ต้องเตรียมอะไรไปบ้างครับ?" },
        { speaker: "bot",      time: "11:45:55", text: "เตรียมบัตรประชาชนตัวจริงไปเพียงอย่างเดียวก็พอครับ ใช้เวลาประมาณ 5-10 นาทีครับ" },
        { speaker: "customer", time: "11:46:08", text: "โอเคครับ ขอบคุณมากครับ" }
      ]
    },

    // ── CALL-007 ─────────────────────────────────────────
    {
      id: "CALL-007",
      caller: "+66 86 777 4433",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "12:10",
      duration: "3m 18s",
      connection: "transferred",
      intent: "TAG_PROBLEM_DOPA",
      intentLabel: "ข้อมูลไม่ถูกต้อง (DOPA)",
      intentCategory: "ekyc",
      resolution: "escalated",
      resolutionLabel: "ส่งเรื่องให้ทีมที่เกี่ยวข้อง",
      linkedTask: "ORD-2341",
      linkedTaskName: "Account Opening Campaign",
      transcript: [
        { speaker: "bot",      time: "12:10:05", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "12:10:15", text: "ระบบแจ้งว่าข้อมูลไม่ตรงกับกรมการปกครองค่ะ แต่ข้อมูลบัตรประชาชนหนูถูกต้องนะคะ" },
        { speaker: "bot",      time: "12:10:27", text: "เข้าใจนะครับ กรณีนี้เป็นปัญหาที่ต้องตรวจสอบกับฐานข้อมูล DOPA โดยตรงครับ" },
        { speaker: "customer", time: "12:10:40", text: "แก้ได้ไหมคะ หรือต้องทำอะไรเพิ่ม?" },
        { speaker: "bot",      time: "12:10:52", text: "ขอโอนเรื่องให้ทีมผู้เชี่ยวชาญดูแลนะครับ เพื่อประสานงานกับ DOPA โดยตรงครับ อาจใช้เวลา 3-5 วันทำการครับ" }
      ]
    },

    // ── CALL-008 ─────────────────────────────────────────
    {
      id: "CALL-008",
      caller: "+66 91 008 2255",
      line: "AIS Line 2",
      date: "14 May 2026",
      time: "12:55",
      duration: "1m 14s",
      connection: "connected",
      intent: "FAQ_CLICXAPP_REGISTRATION",
      intentLabel: "สมัคร / ลงทะเบียนแอป CLICX",
      intentCategory: "faq",
      resolution: "resolved",
      resolutionLabel: "แก้ไขสำเร็จในสาย",
      linkedTask: null,
      linkedTaskName: null,
      transcript: [
        { speaker: "bot",      time: "12:55:10", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "12:55:20", text: "อยากสมัคร CLICX ครับ ต้องทำอะไรบ้าง?" },
        { speaker: "bot",      time: "12:55:30", text: "ดาวน์โหลดแอป CLICX จาก App Store หรือ Play Store ได้เลยครับ จากนั้นกรอกเลขบัตรประชาชน ยืนยันตัวตน แล้วตั้ง PIN ก็เสร็จครับ" },
        { speaker: "customer", time: "12:55:50", text: "โอเคครับ ไม่ยากเลย ขอบคุณครับ" }
      ]
    },

    // ── CALL-009 ─────────────────────────────────────────
    {
      id: "CALL-009",
      caller: "+66 83 560 1122",
      line: "AIS Line 1",
      date: "14 May 2026",
      time: "13:30",
      duration: "2m 05s",
      connection: "connected",
      intent: "TAG_PBLDIPCHIP_DATANOUPDATE",
      intentLabel: "ยืนยันตัวตน Dipchip แล้ว แต่ข้อมูลไม่อัปเดต",
      intentCategory: "dipchip",
      resolution: "pending",
      resolutionLabel: "บันทึก Case รอติดตาม",
      linkedTask: null,
      linkedTaskName: null,
      transcript: [
        { speaker: "bot",      time: "13:30:08", text: "สวัสดีครับ ผมออมใจ ยินดีให้บริการครับ" },
        { speaker: "customer", time: "13:30:18", text: "ไปจด Dipchip มาแล้วเมื่อวานนะคะ แต่กลับมาเช็กในแอปสถานะยังไม่อัปเดตเลยค่ะ" },
        { speaker: "bot",      time: "13:30:30", text: "เข้าใจครับ ปกติข้อมูลจะอัปเดตภายใน 24 ชั่วโมงครับ ลองรีสตาร์ทแอปและเช็กอีกครั้งได้ครับ" },
        { speaker: "customer", time: "13:30:45", text: "ลองแล้วค่ะ ยังไม่ขึ้นอยู่ดีค่ะ" },
        { speaker: "bot",      time: "13:30:55", text: "รับทราบครับ ขอบันทึก Case ไว้ให้นะครับ เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายในวันทำการถัดไปครับ" }
      ]
    },

    // ── CALL-010 ─────────────────────────────────────────
    {
      id: "CALL-010",
      caller: "+66 88 234 9977",
      line: "AIS Line 2",
      date: "14 May 2026",
      time: "14:02",
      duration: "0m 55s",
      connection: "noanswer",
      intent: null,
      intentLabel: null,
      intentCategory: null,
      resolution: null,
      resolutionLabel: null,
      linkedTask: null,
      linkedTaskName: null,
      transcript: []
    }

  ]
};
