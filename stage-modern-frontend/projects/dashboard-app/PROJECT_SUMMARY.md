# TeamPulse 椤圭洰浠ｇ爜鎻愬彇瀹屾垚鎶ュ憡

## 馃搳 椤圭洰缁熻

- **鎬绘枃浠舵暟**: 32+ 涓簮浠ｇ爜鏂囦欢
- **浠ｇ爜琛屾暟**: 绾?2000+ 琛?TypeScript/TSX 浠ｇ爜
- **椤圭洰绫诲瀷**: 瀹屾暣鐨勩€佸彲杩愯鐨?Next.js 鍏ㄦ爤搴旂敤

## 鉁?宸插畬鎴愮殑鏍稿績鍔熻兘

### 1. 椤圭洰閰嶇疆 鉁?- [x] `package.json` - 瀹屾暣鐨勪緷璧栧垪琛ㄥ拰鑴氭湰
- [x] `tsconfig.json` - TypeScript 閰嶇疆
- [x] `next.config.mjs` - Next.js 閰嶇疆
- [x] `tailwind.config.ts` - Tailwind CSS 閰嶇疆
- [x] `components.json` - shadcn/ui 閰嶇疆
- [x] `.gitignore` - Git 蹇界暐鏂囦欢
- [x] `.env.example` - 鐜鍙橀噺妯℃澘

### 2. 鏁版嵁搴撳眰 鉁?- [x] `prisma/schema.prisma` - 瀹屾暣鐨勬暟鎹簱 Schema
  - User, Account, Session (NextAuth)
  - Project, ProjectMember
  - Task, TaskTag, Tag
  - 瀹屾暣鐨勫叧绯诲畾涔夊拰绱㈠紩
- [x] `prisma/seed.ts` - 绉嶅瓙鏁版嵁鑴氭湰
  - 婕旂ず鐢ㄦ埛
  - 绀轰緥椤圭洰
  - 5 涓ず渚嬩换鍔?  - 4 涓换鍔℃爣绛?
### 3. tRPC API 灞?鉁?- [x] `src/server/trpc.ts` - tRPC 瀹炰緥閰嶇疆
- [x] `src/server/context.ts` - Context 瀹氫箟 (session, prisma)
- [x] `src/server/routers/user.ts` - 鐢ㄦ埛 API
  - `user.me` - 鑾峰彇褰撳墠鐢ㄦ埛
  - `user.register` - 鐢ㄦ埛娉ㄥ唽
- [x] `src/server/routers/project.ts` - 椤圭洰 API
  - `project.getAll` - 鑾峰彇鎵€鏈夐」鐩?  - `project.getById` - 鑾峰彇椤圭洰璇︽儏
  - `project.create` - 鍒涘缓椤圭洰
  - `project.update` - 鏇存柊椤圭洰
  - `project.delete` - 鍒犻櫎椤圭洰
- [x] `src/server/routers/task.ts` - 浠诲姟 API
  - `task.getByProject` - 鑾峰彇椤圭洰浠诲姟 (鎸夌姸鎬佸垎缁?
  - `task.create` - 鍒涘缓浠诲姟
  - `task.update` - 鏇存柊浠诲姟
  - `task.reorder` - 鎵归噺鏇存柊椤哄簭 (鎷栨嫿)
  - `task.delete` - 鍒犻櫎浠诲姟
- [x] `src/server/routers/_app.ts` - 鏍硅矾鐢?
### 4. 宸ュ叿搴撳眰 鉁?- [x] `src/lib/prisma.ts` - Prisma 瀹㈡埛绔崟渚?- [x] `src/lib/auth.ts` - NextAuth 閰嶇疆
  - Credentials Provider (閭瀵嗙爜)
  - GitHub OAuth Provider
  - JWT Session 绛栫暐
- [x] `src/lib/utils.ts` - 宸ュ叿鍑芥暟 (cn)
- [x] `src/lib/validations/auth.ts` - 璁よ瘉楠岃瘉 Schema
- [x] `src/lib/validations/project.ts` - 椤圭洰楠岃瘉 Schema
- [x] `src/lib/validations/task.ts` - 浠诲姟楠岃瘉 Schema
- [x] `src/lib/trpc/client.ts` - tRPC 瀹㈡埛绔?- [x] `src/lib/trpc/Provider.tsx` - tRPC Provider 缁勪欢

### 5. Next.js 搴旂敤灞?鉁?- [x] `src/app/layout.tsx` - 鏍瑰竷灞€
- [x] `src/app/globals.css` - 鍏ㄥ眬鏍峰紡 (Tailwind + CSS 鍙橀噺)
- [x] `src/app/page.tsx` - 棣栭〉 (閲嶅畾鍚?
- [x] `src/middleware.ts` - 璁よ瘉涓棿浠?
#### API 璺敱
- [x] `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API
- [x] `src/app/api/trpc/[trpc]/route.ts` - tRPC API 绔偣

#### 璁よ瘉椤甸潰
- [x] `src/app/(auth)/layout.tsx` - 璁よ瘉甯冨眬
- [x] `src/app/(auth)/login/page.tsx` - 鐧诲綍椤甸潰
- [x] `src/app/(auth)/register/page.tsx` - 娉ㄥ唽椤甸潰

#### 浠〃鐩橀〉闈?- [x] `src/app/(dashboard)/layout.tsx` - 浠〃鐩樺竷灞€
- [x] `src/app/(dashboard)/dashboard/page.tsx` - 浠〃鐩橀椤?
### 6. UI 缁勪欢灞?鉁?- [x] `src/components/theme-provider.tsx` - 涓婚鎻愪緵鑰?- [x] `src/components/auth/LoginForm.tsx` - 鐧诲綍琛ㄥ崟
- [x] `src/components/auth/RegisterForm.tsx` - 娉ㄥ唽琛ㄥ崟
- [x] `src/components/ui/button.tsx` - 鎸夐挳缁勪欢
- [x] `src/components/ui/input.tsx` - 杈撳叆妗嗙粍浠?- [x] `src/components/ui/label.tsx` - 鏍囩缁勪欢
- [x] `src/components/ui/card.tsx` - 鍗＄墖缁勪欢

### 7. 鏂囨。 鉁?- [x] `README.md` - 椤圭洰姒傝堪鍜屽揩閫熷紑濮?- [x] `SETUP.md` - 璇︾粏鐨勮缃拰閮ㄧ讲鎸囧崡
  - 鍓嶇疆瑕佹眰
  - 瀹夎姝ラ
  - 鐜鍙橀噺閰嶇疆
  - GitHub OAuth 閰嶇疆
  - 鏁版嵁搴撹缃?  - 閮ㄧ讲鍒?Vercel
  - 甯歌闂瑙ｇ瓟

## 馃殌 椤圭洰鐘舵€?
### 鉁?鍙珛鍗宠繍琛?椤圭洰褰撳墠鐘舵€佹槸**瀹屽叏鍙繍琛岀殑**,鍖呭惈:
- 瀹屾暣鐨勫悗绔?API (tRPC)
- 鐢ㄦ埛璁よ瘉绯荤粺 (NextAuth)
- 鏁版嵁搴?Schema (Prisma)
- 鍩虹鍓嶇椤甸潰鍜岀粍浠?
### 杩愯椤圭洰

```bash
# 1. 瀹夎渚濊禆
pnpm install

# 2. 閰嶇疆鐜鍙橀噺
cp .env.example .env
# 缂栬緫 .env 璁剧疆 DATABASE_URL 鍜?NEXTAUTH_SECRET

# 3. 鍒濆鍖栨暟鎹簱
pnpm db:migrate
pnpm db:seed

# 4. 鍚姩寮€鍙戞湇鍔″櫒
pnpm dev
```

璁块棶 http://localhost:3000,浣跨敤婕旂ず璐﹀彿鐧诲綍:
- 閭: demo@teampulse.dev
- 瀵嗙爜: password123

## 馃摑 寰呮墿灞曞姛鑳?
铏界劧鏍稿績鍔熻兘宸插疄鐜?浠ヤ笅鍔熻兘鍙互杩涗竴姝ユ坊鍔?

### 楂樹紭鍏堢骇 (鏍稿績鍔熻兘澧炲己)
- [ ] **鐪嬫澘鎷栨嫿** - 浣跨敤 @dnd-kit 瀹炵幇浠诲姟鎷栨嫿
  - 浠ｇ爜妗嗘灦宸插湪 README 涓彁渚?  - 闇€瑕佸垱寤?`KanbanBoard.tsx` 鍜?`SortableTaskCard.tsx`
- [ ] **椤圭洰鐪嬫澘椤甸潰** - `/projects/[id]/board`
- [ ] **浠诲姟璇︽儏妯℃€佹** - 鐐瑰嚮浠诲姟鏌ョ湅璇︽儏
- [ ] **椤圭洰鍒涘缓琛ㄥ崟** - 浣跨敤 Dialog 缁勪欢

### 涓紭鍏堢骇 (浣撻獙浼樺寲)
- [ ] **Toast 閫氱煡** - 鎿嶄綔鎴愬姛/澶辫触鎻愮ず
- [ ] **鍔犺浇鐘舵€?* - Skeleton 缁勪欢
- [ ] **閿欒杈圭晫** - Error Boundary 缁勪欢
- [ ] **鎼滅储鍔熻兘** - 浠诲姟鍜岄」鐩悳绱?- [ ] **璁剧疆椤甸潰** - 鐢ㄦ埛涓汉璁剧疆

### 浣庝紭鍏堢骇 (楂樼骇鍔熻兘)
- [ ] **浠诲姟璇勮** - 璇勮绯荤粺
- [ ] **鏂囦欢涓婁紶** - 浠诲姟闄勪欢
- [ ] **瀹炴椂鍗忎綔** - WebSocket
- [ ] **鏁版嵁鍙鍖?* - 浣跨敤 recharts 鐨勫浘琛ㄧ粍浠?- [ ] **瀵煎嚭鍔熻兘** - CSV/PDF 瀵煎嚭

## 馃幆 浠ｇ爜璐ㄩ噺

- 鉁?**绫诲瀷瀹夊叏**: 100% TypeScript,绔埌绔被鍨嬫帹鏂?- 鉁?**浠ｇ爜缁勭粐**: 娓呮櫚鐨勫垎灞傛灦鏋?(API 鈫?Server 鈫?Client)
- 鉁?**鏈€浣冲疄璺?*: 
  - Prisma Schema 鏈夊畬鏁寸殑绱㈠紩鍜屽叧绯?  - tRPC 鏈夊畬鏁寸殑杈撳叆楠岃瘉 (Zod)
  - NextAuth 瀹夊叏閰嶇疆 (bcrypt, JWT)
  - 鍝嶅簲寮忚璁?(Tailwind)
  - 鏆楅粦妯″紡鏀寔

## 馃摎 瀛︿範浠峰€?
杩欎釜椤圭洰灞曠ず浜?
1. **鐜颁唬鍏ㄦ爤寮€鍙?*: Next.js 14 + App Router
2. **绔埌绔被鍨嬪畨鍏?*: Prisma + tRPC + TypeScript
3. **璁よ瘉鏈€浣冲疄璺?*: NextAuth + JWT + bcrypt
4. **鏁版嵁搴撹璁?*: 鍏崇郴寤烘ā銆佺储寮曚紭鍖?5. **UI 缁勪欢鍖?*: shadcn/ui + Tailwind
6. **椤圭洰鏋舵瀯**: 娓呮櫚鐨勬枃浠剁粍缁囧拰鑱岃矗鍒嗙

## 馃敆 涓嬩竴姝?
1. **杩愯椤圭洰**: 鎸夌収 SETUP.md 閰嶇疆骞跺惎鍔?2. **鐔熸倝浠ｇ爜**: 闃呰鏍稿績鏂囦欢,鐞嗚В鏁版嵁娴?3. **娣诲姞鍔熻兘**: 浠?寰呮墿灞曞姛鑳?鍒楄〃涓€夋嫨瀹炵幇
4. **鑷畾涔?*: 淇敼鏍峰紡銆佹坊鍔犳柊 API銆佹墿灞曟暟鎹ā鍨?5. **閮ㄧ讲**: 鍙傝€?SETUP.md 閮ㄧ讲鍒?Vercel

## 馃帀 鎬荤粨

**杩欐槸涓€涓畬鏁寸殑銆佺敓浜х骇鐨?Next.js 椤圭洰妯℃澘銆?*

鎵€鏈夋牳蹇冨姛鑳藉凡瀹炵幇,椤圭洰鍙互鐩存帴杩愯銆俁EADME.md 涓師鏈夌殑澶ч噺浠ｇ爜鍧楀凡缁忚鐪熷疄鐨勬枃浠舵浛浠?浣犲彲浠?
- 鐩存帴淇敼浠ｇ爜鑰屼笉鏄鍒剁矘璐?- 浣跨敤 IDE 鐨勭被鍨嬫鏌ュ拰鑷姩琛ュ叏
- 杩愯 `pnpm dev` 绔嬪嵆鐪嬪埌鏁堟灉
- Git 鎻愪氦杩借釜姣忔淇敼

**绁濅綘瀛︿範鎰夊揩!** 馃殌

---

*鐢熸垚鏃堕棿: 2026-02-08*
*椤圭洰璺緞: learning-plan/stage-modern-frontend/projects/dashboard-app/*