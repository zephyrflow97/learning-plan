# TeamPulse 椤圭洰璁剧疆鎸囧崡

杩欐槸涓€涓畬鏁寸殑銆佸彲杩愯鐨?Next.js + tRPC + Prisma 椤圭洰銆傛湰鏂囨。灏嗘寚瀵间綘瀹屾垚鐜鍑嗗銆佸畨瑁呬緷璧栥€佹暟鎹簱閰嶇疆鍜屾湰鍦拌繍琛屻€?
## 馃搵 鍓嶇疆瑕佹眰

- **Node.js**: 18.17+ (鎺ㄨ崘 20 LTS)
- **鍖呯鐞嗗櫒**: pnpm 8+ (鎺ㄨ崘) / npm / yarn
- **Git**: 鐢ㄤ簬鐗堟湰鎺у埗
- **GitHub 璐﹀彿**: (鍙€? 鐢ㄤ簬 OAuth 鐧诲綍娴嬭瘯

## 馃殌 蹇€熷紑濮?
### Step 1: 瀹夎渚濊禆

```bash
# 鎺ㄨ崘浣跨敤 pnpm (鏇村揩銆佹洿鐪佺鐩樼┖闂?
pnpm install

# 鎴栦娇鐢?npm
npm install
```

杩欏皢瀹夎鎵€鏈夊繀瑕佺殑渚濊禆,鍖呮嫭:
- Next.js 14 (App Router)
- React 18
- Prisma (ORM)
- tRPC (API)
- NextAuth (璁よ瘉)
- Tailwind CSS + shadcn/ui (鏍峰紡)
- 鍏朵粬宸ュ叿搴?
### Step 2: 閰嶇疆鐜鍙橀噺

澶嶅埗 `.env.example` 鍒?`.env`:

```bash
cp .env.example .env
```

缂栬緫 `.env` 鏂囦欢:

```env
# 鏁版嵁搴撹繛鎺?(寮€鍙戠幆澧冧娇鐢?SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth 閰嶇疆
NEXTAUTH_URL="http://localhost:3000"
# 鐢熸垚闅忔満瀵嗛挜: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"

# GitHub OAuth (鍙€?
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

**鐢熸垚 NEXTAUTH_SECRET**:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Step 3: 閰嶇疆 GitHub OAuth (鍙€?

濡傛灉浣犳兂鍚敤 GitHub 绗笁鏂圭櫥褰?

1. 璁块棶 [GitHub Settings 鈫?Developer settings 鈫?OAuth Apps](https://github.com/settings/developers)
2. 鐐瑰嚮 "New OAuth App"
3. 濉啓淇℃伅:
   - **Application name**: TeamPulse (鏈湴寮€鍙?
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 鍒涘缓鍚?澶嶅埗 `Client ID` 鍜岀敓鎴愮殑 `Client Secret` 鍒?`.env` 鏂囦欢

### Step 4: 鍒濆鍖栨暟鎹簱

```bash
# 杩愯鏁版嵁搴撹縼绉?(鍒涘缓琛ㄧ粨鏋?
pnpm db:migrate
# 鎴? npm run db:migrate

# 濉厖绉嶅瓙鏁版嵁 (鍙€?鍒涘缓婕旂ず鏁版嵁)
pnpm db:seed
# 鎴? npm run db:seed
```

**绉嶅瓙鏁版嵁鍖呭惈**:
- 婕旂ず鐢ㄦ埛: `demo@teampulse.dev` / `password123`
- 1 涓ず渚嬮」鐩?- 5 涓ず渚嬩换鍔?- 4 涓换鍔℃爣绛?
### Step 5: 杩愯寮€鍙戞湇鍔″櫒

```bash
pnpm dev
# 鎴? npm run dev
```

鎵撳紑娴忚鍣ㄨ闂?[http://localhost:3000](http://localhost:3000)

**婕旂ず璐﹀彿**:
- 閭: `demo@teampulse.dev`
- 瀵嗙爜: `password123`

## 馃搨 椤圭洰缁撴瀯

```
dashboard-app/
鈹溾攢鈹€ prisma/
鈹?  鈹溾攢鈹€ schema.prisma      # 鏁版嵁搴?Schema 瀹氫箟
鈹?  鈹溾攢鈹€ seed.ts            # 绉嶅瓙鏁版嵁鑴氭湰
鈹?  鈹斺攢鈹€ migrations/        # 鏁版嵁搴撹縼绉诲巻鍙?鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ app/               # Next.js App Router 椤甸潰
鈹?  鈹?  鈹溾攢鈹€ (auth)/        # 璁よ瘉璺敱缁?(login, register)
鈹?  鈹?  鈹溾攢鈹€ (dashboard)/   # 浠〃鐩樿矾鐢辩粍 (闇€瑕佺櫥褰?
鈹?  鈹?  鈹溾攢鈹€ api/           # API 璺敱 (NextAuth, tRPC)
鈹?  鈹?  鈹溾攢鈹€ layout.tsx     # 鏍瑰竷灞€
鈹?  鈹?  鈹斺攢鈹€ globals.css    # 鍏ㄥ眬鏍峰紡
鈹?  鈹溾攢鈹€ components/        # React 缁勪欢
鈹?  鈹?  鈹溾攢鈹€ ui/            # shadcn/ui 鍩虹缁勪欢
鈹?  鈹?  鈹溾攢鈹€ auth/          # 璁よ瘉鐩稿叧缁勪欢
鈹?  鈹?  鈹溾攢鈹€ task/          # 浠诲姟鐩稿叧缁勪欢 (鐪嬫澘銆佸崱鐗?
鈹?  鈹?  鈹溾攢鈹€ dashboard/     # 浠〃鐩樺浘琛ㄧ粍浠?鈹?  鈹?  鈹斺攢鈹€ layout/        # 甯冨眬缁勪欢 (瀵艰埅鏍忋€佷晶杈规爮)
鈹?  鈹溾攢鈹€ server/            # tRPC 鏈嶅姟绔唬鐮?鈹?  鈹?  鈹溾攢鈹€ routers/       # API 璺敱 (user, project, task)
鈹?  鈹?  鈹溾攢鈹€ context.ts     # tRPC Context (session, prisma)
鈹?  鈹?  鈹斺攢鈹€ trpc.ts        # tRPC 瀹炰緥閰嶇疆
鈹?  鈹溾攢鈹€ lib/               # 宸ュ叿鍑芥暟
鈹?  鈹?  鈹溾攢鈹€ prisma.ts      # Prisma 鍗曚緥
鈹?  鈹?  鈹溾攢鈹€ auth.ts        # NextAuth 閰嶇疆
鈹?  鈹?  鈹溾攢鈹€ utils.ts       # 閫氱敤宸ュ叿鍑芥暟
鈹?  鈹?  鈹溾攢鈹€ validations/   # Zod Schema 楠岃瘉
鈹?  鈹?  鈹斺攢鈹€ trpc/          # tRPC 瀹㈡埛绔厤缃?鈹?  鈹溾攢鈹€ hooks/             # 鑷畾涔?React Hooks
鈹?  鈹斺攢鈹€ types/             # TypeScript 绫诲瀷瀹氫箟
鈹溾攢鈹€ .env                   # 鐜鍙橀噺 (涓嶆彁浜ゅ埌 Git)
鈹溾攢鈹€ .env.example           # 鐜鍙橀噺妯℃澘
鈹溾攢鈹€ package.json           # 渚濊禆鍜岃剼鏈?鈹溾攢鈹€ tsconfig.json          # TypeScript 閰嶇疆
鈹溾攢鈹€ tailwind.config.ts     # Tailwind CSS 閰嶇疆
鈹斺攢鈹€ next.config.mjs        # Next.js 閰嶇疆
```

## 馃敡 甯哥敤鍛戒护

```bash
# 寮€鍙?pnpm dev                   # 鍚姩寮€鍙戞湇鍔″櫒 (http://localhost:3000)

# 鏁版嵁搴?pnpm db:push               # 鎺ㄩ€?Schema 鍒版暟鎹簱 (蹇€熷師鍨?
pnpm db:migrate            # 鍒涘缓骞惰繍琛屾暟鎹簱杩佺Щ
pnpm db:seed               # 杩愯绉嶅瓙鏁版嵁鑴氭湰
pnpm db:studio             # 鎵撳紑 Prisma Studio (鏁版嵁搴撳彲瑙嗗寲宸ュ叿)

# 鏋勫缓
pnpm build                 # 鐢熶骇鏋勫缓
pnpm start                 # 鍚姩鐢熶骇鏈嶅姟鍣?
# 浠ｇ爜璐ㄩ噺
pnpm lint                  # 杩愯 ESLint 妫€鏌?```

## 馃З 娣诲姞 shadcn/ui 缁勪欢

椤圭洰宸茬粡闆嗘垚浜?shadcn/ui銆傝娣诲姞鏇村缁勪欢:

```bash
# 鏌ョ湅鍙敤缁勪欢
npx shadcn@latest add

# 娣诲姞鐗瑰畾缁勪欢 (渚嬪: dialog, dropdown-menu, toast)
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
```

缁勪欢浼氳娣诲姞鍒?`src/components/ui/` 鐩綍,浣犲彲浠ヨ嚜鐢变慨鏀广€?
## 馃搳 鏌ョ湅鏁版嵁搴?
浣跨敤 Prisma Studio 鍙鍖栨煡鐪嬪拰缂栬緫鏁版嵁搴撴暟鎹?

```bash
pnpm db:studio
# 鎴? npx prisma studio
```

浼氳嚜鍔ㄦ墦寮€ [http://localhost:5555](http://localhost:5555)

## 馃殺 閮ㄧ讲鍒?Vercel

### Step 1: 鎺ㄩ€佸埌 GitHub

```bash
git init
git add .
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Initial commit: TeamPulse project"
git branch -M main
git remote add origin https://github.com/your-username/teampulse.git
git push -u origin main
```

### Step 2: 杩炴帴 Vercel

1. 璁块棶 [vercel.com](https://vercel.com) 骞朵娇鐢?GitHub 鐧诲綍
2. 鐐瑰嚮 "Import Project"
3. 閫夋嫨浣犵殑 GitHub 浠撳簱
4. Vercel 鑷姩妫€娴?Next.js 椤圭洰,鏃犻渶棰濆閰嶇疆

### Step 3: 閰嶇疆鐢熶骇鐜鍙橀噺

鍦?Vercel 椤圭洰璁剧疆涓坊鍔?

```env
DATABASE_URL=your_production_postgres_url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_production_secret
GITHUB_CLIENT_ID=your_github_client_id (鍙€?
GITHUB_CLIENT_SECRET=your_github_client_secret (鍙€?
```

### Step 4: 閰嶇疆鐢熶骇鏁版嵁搴?
**閫夐」 1: Vercel Postgres** (鎺ㄨ崘)

```bash
# 鍦?Vercel 椤圭洰涓垱寤?Postgres 鏁版嵁搴?vercel link
vercel postgres create
vercel env pull .env.production.local
```

**閫夐」 2: Supabase**

1. 璁块棶 [supabase.com](https://supabase.com) 鍒涘缓椤圭洰
2. 鑾峰彇鏁版嵁搴撹繛鎺?URL (Settings 鈫?Database 鈫?Connection string)
3. 鍦?Vercel 涓缃?`DATABASE_URL`

### Step 5: 杩愯鐢熶骇杩佺Щ

```bash
# 鏈湴杩愯杩佺Щ鍒扮敓浜ф暟鎹簱
npx prisma migrate deploy
```

### Step 6: 閮ㄧ讲

```bash
git push origin main
```

Vercel 浼氳嚜鍔ㄨЕ鍙戦儴缃?2-3 鍒嗛挓鍚庤闂綘鐨勫煙鍚?

## 馃悰 甯歌闂

### Q: 杩愯 `pnpm dev` 鎶ラ敊 "Cannot find module '@prisma/client'"

**A**: 闇€瑕佸厛鐢熸垚 Prisma Client:

```bash
npx prisma generate
pnpm dev
```

### Q: 鏁版嵁搴撹縼绉诲け璐?"Database locked" (SQLite)

**A**: SQLite 涓嶆敮鎸侀珮骞跺彂銆傝В鍐虫柟妗?
1. 鍏抽棴鎵€鏈夋鍦ㄨ繍琛岀殑鏈嶅姟鍣?(`Ctrl+C`)
2. 鍒犻櫎 `prisma/dev.db` 鏂囦欢
3. 閲嶆柊杩愯 `pnpm db:migrate`

### Q: tRPC 绫诲瀷涓嶈嚜鍔ㄦ洿鏂?
**A**: 閲嶅惎 TypeScript 鏈嶅姟鍣?
- VSCode: `Cmd+Shift+P` (Mac) 鎴?`Ctrl+Shift+P` (Windows)
- 杈撳叆 "Restart TS Server"

### Q: 鐧诲綍鍚庤烦杞埌 404

**A**: 纭繚宸插垱寤?`/dashboard` 璺敱:
- 妫€鏌?`src/app/(dashboard)/dashboard/page.tsx` 鏄惁瀛樺湪

### Q: GitHub OAuth 鐧诲綍澶辫触

**A**: 妫€鏌ヤ互涓嬪嚑鐐?
1. `.env` 涓殑 `GITHUB_CLIENT_ID` 鍜?`GITHUB_CLIENT_SECRET` 鏄惁姝ｇ‘
2. GitHub OAuth App 鐨勫洖璋?URL 鏄惁璁剧疆涓?`http://localhost:3000/api/auth/callback/github`
3. 灏濊瘯閲嶅惎寮€鍙戞湇鍔″櫒

## 馃摎 涓嬩竴姝?
瀹屾垚鍩虹閰嶇疆鍚?浣犲彲浠?

1. **瀹屽杽 UI 缁勪欢**: 鍙傝€?README.md 涓殑浠ｇ爜绀轰緥,瀹炵幇鐪嬫澘鎷栨嫿銆佷换鍔″崱鐗囩瓑缁勪欢
2. **娣诲姞鏇村鍔熻兘**: 
   - 浠诲姟璇勮绯荤粺
   - 鏂囦欢闄勪欢涓婁紶
   - 瀹炴椂閫氱煡 (WebSocket)
   - 鏁版嵁瀵煎嚭 (CSV/PDF)
3. **浼樺寲鎬ц兘**:
   - 娣诲姞 React Query 缂撳瓨绛栫暐
   - 浣跨敤 Next.js Image 浼樺寲鍥剧墖
   - 瀹炵幇 ISR (澧為噺闈欐€佸啀鐢熸垚)
4. **缂栧啓娴嬭瘯**:
   - Vitest + React Testing Library (鍗曞厓娴嬭瘯)
   - Playwright (E2E 娴嬭瘯)

## 馃摉 瀛︿範璧勬簮

- **Next.js 鏂囨。**: https://nextjs.org/docs
- **Prisma 鏂囨。**: https://www.prisma.io/docs
- **tRPC 鏂囨。**: https://trpc.io/docs
- **NextAuth 鏂囨。**: https://next-auth.js.org
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## 馃挰 鑾峰彇甯姪

閬囧埌闂?
1. 鏌ョ湅鏈枃妗ｇ殑"甯歌闂"閮ㄥ垎
2. 闃呰 README.md 涓殑璇︾粏鎶€鏈鏄?3. 妫€鏌?GitHub Issues (濡傛灉椤圭洰寮€婧?
4. 鍙傝€冨畼鏂规枃妗ｉ摼鎺?
---

**馃帀 绁濅綘寮€鍙戦『鍒?** 濡傛灉浣犲畬鎴愪簡杩欎釜椤圭洰,鍒繕浜嗗湪绠€鍘嗕腑灞曠ず瀹?