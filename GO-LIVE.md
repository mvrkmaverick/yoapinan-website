# 🚀 Go-Live: เปิด www.yoapinan.com (GitHub Pages + GoDaddy)

> ขั้นตอนนี้ต้องใช้บัญชี **GitHub** และ **GoDaddy** ที่ล็อกอินของคุณ (มี 2FA/DNS)
> ใช้เวลารวม ~10–15 นาที + รอ DNS อีก 10 นาที–1 ชม.
> 👉 ถ้าต้องการ ผมช่วย **คุมเบราว์เซอร์ทำให้ทีละขั้น** ได้ (คุณกรอกรหัส/2FA เอง) — บอกได้เลย

ผมแนะนำ **GitHub Pages** เพราะฟรี + ทำงานคู่กับปุ่ม **Publish** ใน CMS (แก้เนื้อหาแล้วขึ้นเว็บอัตโนมัติ)

---

## ขั้นที่ 1 — เอาโค้ดขึ้น GitHub

1. ไป [github.com/new](https://github.com/new) → ตั้งชื่อ repo เช่น **`yoapinan-website`** → เลือก **Public** → **Create repository**
2. ในหน้า repo กด **Add file → Upload files**
3. เปิดโฟลเดอร์ `yoapinan-website` ในเครื่อง แล้ว **ลากไฟล์+โฟลเดอร์ทั้งหมดด้านใน** (index.html, admin.html, assets/, data/ ฯลฯ) มาวางในหน้าเว็บ GitHub
   - การลากทั้งโฟลเดอร์บน Chrome จะเก็บโครงสร้าง assets/ และ data/ ให้อัตโนมัติ
   - หรือใช้ไฟล์ **`yoapinan-website.zip`** ที่แนบให้ → แตก zip แล้วลากไฟล์ "ด้านใน" folder เข้าไป (อย่าลากตัวโฟลเดอร์ครอบ)
4. กด **Commit changes**

> สำคัญ: ไฟล์ `index.html` ต้องอยู่ที่ **ราก** ของ repo (ไม่ใช่ใน subfolder)

---

## ขั้นที่ 2 — เปิด GitHub Pages

1. ใน repo → **Settings → Pages**
2. **Source:** Deploy from a branch → **Branch: `main`** / Folder: **`/ (root)`** → **Save**
3. รอ ~1 นาที จะได้ลิงก์ทดสอบ `https://<username>.github.io/yoapinan-website/`
   เปิดดูได้เลยว่าเว็บขึ้นถูกต้องไหม (ก่อนต่อโดเมน)

---

## ขั้นที่ 3 — ตั้ง DNS ที่ GoDaddy

ไป [dcc.godaddy.com](https://dcc.godaddy.com) → โดเมน **yoapinan.com** → **DNS / Manage DNS**

เพิ่ม/แก้เรคคอร์ดตามนี้:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `185.199.108.153` | 600 |
| A | @ | `185.199.109.153` | 600 |
| A | @ | `185.199.110.153` | 600 |
| A | @ | `185.199.111.153` | 600 |
| CNAME | www | `<username>.github.io` | 600 |

> แทน `<username>` ด้วยชื่อผู้ใช้ GitHub ของคุณ (เช่นถ้าชื่อ `apinan` ก็ใส่ `apinan.github.io`)
> ลบเรคคอร์ด A/CNAME เก่าของ @ และ www ที่ GoDaddy ใส่มา (เช่น Parked) ออกก่อน
> (ออปชัน IPv6 — เพิ่ม AAAA @ : `2606:50c0:8000::153`, `:8001::153`, `:8002::153`, `:8003::153`)

---

## ขั้นที่ 4 — ผูกโดเมนใน GitHub Pages

1. กลับไป **Settings → Pages → Custom domain** → ใส่ **`www.yoapinan.com`** → **Save**
   (GitHub จะสร้างไฟล์ `CNAME` ใน repo ให้อัตโนมัติ)
2. รอ DNS อัปเดต (10 นาที–1 ชม.) จนขึ้นเครื่องหมายถูก
3. ติ๊ก **Enforce HTTPS** (รอ certificate สักครู่)
4. อยากให้พิมพ์ `yoapinan.com` เฉย ๆ แล้วเด้งไป www ด้วย — ที่ GoDaddy ตั้ง **Domain Forwarding** `yoapinan.com → https://www.yoapinan.com` (หรือปล่อยให้ A records ทำงานคู่กันก็ได้)

✅ เสร็จแล้ว เปิด **https://www.yoapinan.com** ได้เลย

---

## ขั้นที่ 5 — เปิดปุ่ม Publish ใน CMS (แก้เว็บเองได้ตลอด)

ทำตาม **README.md → ข้อ 5** (สร้าง GitHub Token → กรอกในหน้า admin → Deploy)
หลังจากนั้นแก้เนื้อหาในหน้า `admin.html` แล้วกด **🚀 Publish** → GitHub อัปเดต → Pages build ใหม่ ~1–2 นาที → เว็บเปลี่ยนทันที

---

## ทางเลือก (ถ้าไม่อยากใช้ GitHub web upload)
- **Netlify:** ลาก "โฟลเดอร์ `yoapinan-website`" ทั้งอันลงที่ [app.netlify.com/drop](https://app.netlify.com/drop) → ได้เว็บทันที แล้วค่อยต่อ Custom domain + DNS (A → `75.2.60.5`, CNAME www → ชื่อไซต์ `.netlify.app`)
  - แต่ถ้าใช้ Netlify แบบ drag จะยังไม่ผูกกับ GitHub → ปุ่ม Publish ใน CMS จะใช้ไม่ได้ (ต้องต่อ GitHub แทน)
- **ให้ผมช่วยคุมเบราว์เซอร์:** ตอนคุณกลับมา เปิด GitHub/GoDaddy ค้างไว้ (ล็อกอินแล้ว) บอกผม เดี๋ยวผมไล่กดให้ทีละขั้น
