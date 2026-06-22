# YoApinan.com — เว็บไซต์ + ระบบจัดการเนื้อหา (CMS)

เว็บไซต์แบบ **static** (ไม่มีค่ารายเดือนของ website builder) พร้อม **ระบบ Admin จัดการเนื้อหาเอง**
แก้บทความ/รูป/ราคา/ลิงก์ ได้ในเบราว์เซอร์ แล้วกด **Publish** → เว็บอัปเดตอัตโนมัติ

---

## 1. โครงสร้างไฟล์

```
yoapinan-website/
├── index.html          # หน้าแรก
├── market-ideas.html   # รวมบทความ Market Ideas
├── field-notes.html    # รวมบทความ Field Notes
├── about.html          # เกี่ยวกับผม
├── course.html         # คอร์สเรียน (Snowball Profit System)
├── article.html        # หน้าบทความเดี่ยว (อ่านจาก ?slug=)
├── admin.html          # ⭐ ระบบจัดการเนื้อหา (CMS) — เปิดหน้านี้เพื่อแก้เว็บ
├── data/
│   └── content.js      # ⭐ เนื้อหาทั้งเว็บอยู่ในไฟล์เดียวนี้ (CMS เขียนทับให้อัตโนมัติ)
└── assets/
    ├── css/  (styles.css = หน้าเว็บ, admin.css = หน้า admin)
    ├── js/   (site.js, render.js = หน้าเว็บ, admin.js = CMS)
    └── img/  (logo.svg และรูปที่อัปโหลด)
```

> เนื้อหาทั้งหมดถูกแยกไว้ที่ `content.js` — หน้าเว็บทุกหน้าดึงข้อมูลจากที่นี่
> ดังนั้น **แก้ที่เดียว เปลี่ยนทั้งเว็บ** และ Admin ก็แก้ไฟล์นี้ให้คุณ

---

## 2. ดูเว็บบนเครื่องตัวเอง (ก่อน deploy)

ดับเบิลคลิก `index.html` ได้เลย — เปิดในเบราว์เซอร์แล้วใช้งานได้ครบทุกหน้า
(สคริปต์และ CSS โหลดแบบ local ได้ ไม่ต้องตั้ง server)

แก้เนื้อหา: ดับเบิลคลิก `admin.html`

---

## 3. แก้เนื้อหา / เพิ่มบทความ ด้วย Admin (CMS)

เปิด `admin.html` แล้วใช้เมนูซ้าย:

| เมนู | ใช้ทำอะไร |
|------|-----------|
| **แดชบอร์ด** | ภาพรวม + ปุ่มลัด |
| **บทความ** | เพิ่ม/แก้/ลบ บทความ Market Ideas และ Field Notes (มี live preview ของ Markdown) |
| **หน้าแรก / เกี่ยวกับผม / คอร์สเรียน** | แก้ข้อความทุกส่วนของแต่ละหน้า |
| **ตั้งค่าทั่วไป** | ลิงก์ LINE, Facebook, ราคา, Disclaimer ฯลฯ |
| **Publish / Deploy** | เชื่อม GitHub เพื่อกดขึ้นเว็บอัตโนมัติ + ดาวน์โหลด/นำเข้าไฟล์ |

ปุ่มมุมขวาบน:
- **ดูตัวอย่าง** — เปิดเว็บจริงพร้อมเนื้อหาที่กำลังแก้ (ยังไม่ publish)
- **บันทึกร่าง** — เก็บฉบับร่างไว้ในเครื่อง (เปิดมาแก้ต่อได้)
- **Publish** — ส่งขึ้นเว็บจริง (ต้องตั้งค่า GitHub ก่อน — ดูข้อ 5)

**การใส่รูป:** ในหน้าแก้บทความ/แต่ละเพจ จะมีช่อง “รูป” ให้กดอัปโหลดจากเครื่อง หรือวาง URL ก็ได้
> 💡 แนะนำย่อรูปให้ < 1.5MB ก่อนอัปโหลด เพื่อให้เว็บโหลดเร็ว (รูปถูกฝังลงไฟล์ข้อมูล)
> ถ้ามีรูปเยอะ/ใหญ่ แนะนำอัปโหลดรูปขึ้น host รูป (เช่น Cloudinary/Imgur) แล้ววาง URL แทน

---

## 4. เอาเว็บขึ้นออนไลน์ (แนะนำ: Cloudflare Pages หรือ Netlify — ฟรี)

เว็บนี้เป็น static ล้วน วางที่ไหนก็ได้ ขั้นตอน (ทำครั้งเดียว):

### 4.1 อัปโหลดโค้ดขึ้น GitHub
1. สมัคร/ล็อกอิน [github.com](https://github.com) → กด **New repository**
   - ตั้งชื่อ เช่น `yoapinan-website` → เลือก **Private** ก็ได้ → Create
2. อัปไฟล์ทั้งหมดในโฟลเดอร์นี้เข้า repo
   - ง่ายสุด: หน้า repo กด **Add file → Upload files** แล้วลากไฟล์/โฟลเดอร์ทั้งหมดเข้าไป → Commit

### 4.2 เชื่อมกับ Netlify (หรือ Cloudflare Pages)
**Netlify** — [app.netlify.com](https://app.netlify.com)
1. **Add new site → Import an existing project → GitHub** → เลือก repo
2. ตั้งค่า build:
   - **Build command:** เว้นว่าง
   - **Publish directory:** `/` (root)
3. **Deploy** → ได้ลิงก์ `xxxx.netlify.app` ใช้งานได้ทันที

**Cloudflare Pages** — [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git
- Framework preset: **None**, Build command: เว้นว่าง, Output directory: `/`

ทั้งสองเจ้า: **ทุกครั้งที่ไฟล์ใน GitHub เปลี่ยน เว็บจะ build ใหม่อัตโนมัติ** (นี่คือเหตุผลที่ปุ่ม Publish ใน CMS ทำงานได้)

### 4.3 ต่อโดเมน yoapinan.com
- Netlify: Site → **Domain management → Add custom domain** → ใส่ `yoapinan.com` → ทำตามที่ระบบบอก (ชี้ DNS/Nameserver)
- Cloudflare Pages: **Custom domains → Set up a domain**
- ระบบจะออก SSL (https) ให้ฟรีอัตโนมัติ

---

## 5. ตั้งค่า “Publish ขึ้นเว็บอัตโนมัติ” ใน CMS

หลัง deploy แล้ว (ข้อ 4) ทำให้ปุ่ม **Publish** ในหน้า admin ใช้ได้:

### 5.1 สร้าง GitHub Token (ทำครั้งเดียว)
1. ไปที่ [github.com/settings/tokens](https://github.com/settings/tokens) → **Fine-grained tokens → Generate new token**
2. ตั้งชื่อ เช่น `yoapinan-cms` → **Repository access:** เลือก **Only select repositories** → เลือก repo เว็บ
3. **Permissions → Repository permissions → Contents → Read and write**
4. Generate → **คัดลอก token** (ขึ้นต้น `github_pat_...`) เก็บไว้

### 5.2 กรอกในหน้า admin → เมนู “Publish / Deploy”
- **GitHub Username/Org:** ชื่อผู้ใช้ GitHub ของคุณ
- **Repository:** ชื่อ repo (เช่น `yoapinan-website`)
- **Branch:** `main`
- **ตำแหน่งไฟล์ข้อมูล:** `content.js`
- **GitHub Token:** วาง token จากข้อ 5.1
- กด **ทดสอบการเชื่อมต่อ** → ถ้าขึ้น ✓ แปลว่าพร้อม

จากนั้นทุกครั้งที่แก้เนื้อหาเสร็จ กด **🚀 Publish** → รอ host build ~1–2 นาที → เว็บอัปเดต

> 🔒 **ความปลอดภัย:** Token ถูกเก็บใน browser ของคุณเครื่องเดียวเท่านั้น (localStorage)
> ไม่ถูกส่งไปที่ไหนนอกจาก GitHub โดยตรง ถ้าใช้เครื่องสาธารณะอย่ากรอก
> ถ้าต้องการล็อกหน้า `admin.html` ไม่ให้คนอื่นเปิด ใช้ Netlify/Cloudflare Access ตั้งรหัสผ่านหน้าได้

### ทางเลือกแบบไม่ใช้ GitHub
ในเมนู Deploy มีปุ่ม **ดาวน์โหลด content.js** → เอาไฟล์ไปวางทับ `content.js` เองแล้วอัปขึ้น host
และปุ่ม **นำเข้า (Import)** สำหรับโหลดไฟล์เดิมกลับมาแก้

---

## 6. แก้ลิงก์สำคัญก่อนใช้งานจริง

ในหน้า admin → **ตั้งค่าทั่วไป** อย่าลืมแก้:
- **ลิงก์ LINE** (ตอนนี้เป็น placeholder `https://line.me/R/ti/p/@yourlineid`)
- **ลิงก์ Facebook / Twitter**
- **ลิงก์ลงทะเบียน/ชำระเงิน** (ปุ่ม “ลงทะเบียนเรียนทันที” ในหน้าคอร์ส)
- **ราคา** (ถ้าเปลี่ยนจาก ฿16,800)

---

## 7. หมายเหตุทางเทคนิค

- ไม่ต้องใช้ build tool ใด ๆ — เป็น HTML/CSS/JS ล้วน
- รองรับมือถือ (responsive) และมี SEO meta tags พื้นฐานในทุกหน้า
- บทความใช้ URL แบบ `article.html?slug=ชื่อบทความ`
- ฟอนต์: Sora + Noto Sans Thai (โหลดจาก Google Fonts)
- Disclaimer การลงทุนถูกใส่ไว้ที่ footer ทุกหน้า + ท้ายบทความ

---

จัดทำโดย Cowork — ปรับแก้ทุกอย่างได้เองผ่าน `admin.html`
