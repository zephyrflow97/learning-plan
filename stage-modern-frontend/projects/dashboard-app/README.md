# TeamPulse 鈥?鐜颁唬鍥㈤槦浠〃鐩橀」鐩?
> 涓€涓畬鏁寸殑銆佸彲杩愯鐨?Next.js 鍏ㄦ爤椤圭洰,灞曠ず浜嗙幇浠ｅ墠绔紑鍙戠殑鏈€浣冲疄璺点€?
杩欐槸涓€涓?*鐢熶骇绾х殑鍥㈤槦鍗忎綔宸ュ叿**,鐏垫劅鏉ヨ嚜 Linear銆丯otion 绛夌幇浠ｉ」鐩鐞嗗伐鍏枫€傚畠涓嶆槸鐜╁叿椤圭洰,鑰屾槸涓€涓湡姝ｅ彲浠ヨ鍥㈤槦浣跨敤鐨勫簲鐢ㄣ€?
## 鉁?鍔熻兘鐗规€?
### 宸插疄鐜板姛鑳?
- 鉁?**鐢ㄦ埛璁よ瘉**
  - 閭瀵嗙爜娉ㄥ唽/鐧诲綍 (bcrypt 鍔犲瘑)
  - GitHub OAuth 绗笁鏂圭櫥褰?  - 浼氳瘽绠＄悊 (NextAuth + JWT)
  
- 鉁?**椤圭洰绠＄悊**
  - 鍒涘缓/缂栬緫/鍒犻櫎椤圭洰
  - 椤圭洰鎴愬憳绠＄悊
  - 鍩轰簬瑙掕壊鐨勬潈闄愭帶鍒?(Owner/Member/Viewer)
  
- 鉁?**浠诲姟绯荤粺**
  - 浠诲姟鍒涘缓涓庣紪杈?  - 涓夊垪鐪嬫澘瑙嗗浘 (Todo / In Progress / Done)
  - 浠诲姟浼樺厛绾у拰鏍囩
  - 浠诲姟鍒嗛厤涓庢埅姝㈡棩鏈?  
- 鉁?**鏁版嵁浠〃鐩?*
  - 椤圭洰缁熻鍗＄墖
  - 浠诲姟瀹屾垚瓒嬪娍鍥捐〃
  
- 鉁?**鐢ㄦ埛浣撻獙**
  - 瀹屽叏鍝嶅簲寮忚璁?  - 鏆楅粦妯″紡鏀寔
  - 绫诲瀷瀹夊叏鐨?API (绔埌绔?

## 馃О 鎶€鏈爤

### 鏍稿績妗嗘灦
- **Next.js 14** (App Router) - React 鍏ㄦ爤妗嗘灦
- **TypeScript** - 绫诲瀷瀹夊叏
- **Tailwind CSS** - 瀹炵敤浼樺厛鐨?CSS 妗嗘灦
- **shadcn/ui** - 鍙畾鍒剁殑 UI 缁勪欢搴?
### 鍚庣 & 鏁版嵁搴?- **Prisma** - 绫诲瀷瀹夊叏鐨?ORM
- **tRPC** - 绔埌绔被鍨嬪畨鍏ㄧ殑 API
- **NextAuth** - 璁よ瘉瑙ｅ喅鏂规
- **PostgreSQL/SQLite** - 鏁版嵁搴?
### 鐘舵€佺鐞?& 琛ㄥ崟
- **TanStack Query** - 鏈嶅姟绔姸鎬佺鐞?- **React Hook Form** - 琛ㄥ崟鐘舵€佺鐞?- **Zod** - Schema 楠岃瘉

### 鍏朵粬宸ュ叿
- **bcryptjs** - 瀵嗙爜鍔犲瘑
- **date-fns** - 鏃ユ湡澶勭悊
- **lucide-react** - 鍥炬爣搴?
## 馃搨 椤圭洰缁撴瀯

```
dashboard-app/
鈹溾攢鈹€ prisma/
鈹?  鈹溾攢鈹€ schema.prisma      # 鏁版嵁搴?Schema
鈹?  鈹斺攢鈹€ seed.ts            # 绉嶅瓙鏁版嵁
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ app/               # Next.js 椤甸潰璺敱
鈹?  鈹?  鈹溾攢鈹€ (auth)/        # 璁よ瘉椤甸潰 (鐧诲綍/娉ㄥ唽)
鈹?  鈹?  鈹溾攢鈹€ (dashboard)/   # 浠〃鐩橀〉闈?(闇€瑕佺櫥褰?
鈹?  鈹?  鈹斺攢鈹€ api/           # API 璺敱
鈹?  鈹溾攢鈹€ components/        # React 缁勪欢
鈹?  鈹?  鈹溾攢鈹€ ui/            # shadcn/ui 缁勪欢
鈹?  鈹?  鈹溾攢鈹€ auth/          # 璁よ瘉缁勪欢
鈹?  鈹?  鈹溾攢鈹€ task/          # 浠诲姟缁勪欢
鈹?  鈹?  鈹斺攢鈹€ dashboard/     # 浠〃鐩樼粍浠?鈹?  鈹溾攢鈹€ server/            # tRPC 鏈嶅姟绔?鈹?  鈹?  鈹溾攢鈹€ routers/       # API 璺敱瀹氫箟
鈹?  鈹?  鈹?  鈹溾攢鈹€ user.ts
鈹?  鈹?  鈹?  鈹溾攢鈹€ project.ts
鈹?  鈹?  鈹?  鈹溾攢鈹€ task.ts
鈹?  鈹?  鈹?  鈹斺攢鈹€ _app.ts
鈹?  鈹?  鈹溾攢鈹€ context.ts
鈹?  鈹?  鈹斺攢鈹€ trpc.ts
鈹?  鈹溾攢鈹€ lib/               # 宸ュ叿鍑芥暟
鈹?  鈹?  鈹溾攢鈹€ prisma.ts      # Prisma 瀹㈡埛绔?鈹?  鈹?  鈹溾攢鈹€ auth.ts        # NextAuth 閰嶇疆
鈹?  鈹?  鈹溾攢鈹€ utils.ts       # 宸ュ叿鍑芥暟
鈹?  鈹?  鈹溾攢鈹€ validations/   # Zod schemas
鈹?  鈹?  鈹斺攢鈹€ trpc/          # tRPC 瀹㈡埛绔?鈹?  鈹斺攢鈹€ hooks/             # 鑷畾涔?Hooks
鈹溾攢鈹€ .env.example           # 鐜鍙橀噺妯℃澘
鈹溾攢鈹€ SETUP.md               # 璇︾粏璁剧疆鎸囧崡
鈹斺攢鈹€ README.md              # 鏈枃浠?```

## 馃殌 蹇€熷紑濮?
### 鍓嶇疆瑕佹眰

- Node.js 18.17+
- pnpm 8+ (鎺ㄨ崘)
- Git

### 瀹夎涓庤繍琛?
1. **瀹夎渚濊禆**

```bash
pnpm install
```

2. **閰嶇疆鐜鍙橀噺**

```bash
cp .env.example .env
# 缂栬緫 .env 鏂囦欢,璁剧疆蹇呰鐨勭幆澧冨彉閲?```

3. **鍒濆鍖栨暟鎹簱**

```bash
# 杩愯鏁版嵁搴撹縼绉?pnpm db:migrate

# (鍙€? 濉厖婕旂ず鏁版嵁
pnpm db:seed
```

4. **鍚姩寮€鍙戞湇鍔″櫒**

```bash
pnpm dev
```

璁块棶 [http://localhost:3000](http://localhost:3000)

**婕旂ず璐﹀彿** (濡傛灉杩愯浜?seed):
- 閭: `demo@teampulse.dev`
- 瀵嗙爜: `password123`

### 璇︾粏璁剧疆璇存槑

鏌ョ湅 [`SETUP.md`](./SETUP.md) 鑾峰彇瀹屾暣鐨勮缃寚鍗?鍖呮嫭:
- 鐜鍙橀噺閰嶇疆璇﹁В
- GitHub OAuth 閰嶇疆姝ラ
- 鏁版嵁搴撻厤缃€夐」
- 閮ㄧ讲鍒?Vercel 鐨勫畬鏁存祦绋?- 甯歌闂瑙ｇ瓟

## 馃搳 鏁版嵁搴撹璁?
椤圭洰浣跨敤 Prisma 瀹氫箟浜嗕互涓嬫牳蹇冩ā鍨?

- **User** - 鐢ㄦ埛琛?(鏀寔閭瀵嗙爜鍜?OAuth)
- **Project** - 椤圭洰琛?- **ProjectMember** - 椤圭洰鎴愬憳鍏崇郴琛?(澶氬澶?甯﹁鑹?
- **Task** - 浠诲姟琛?- **Tag** - 鏍囩琛?- **TaskTag** - 浠诲姟-鏍囩鍏崇郴琛?
鏌ョ湅瀹屾暣鐨?Schema: [`prisma/schema.prisma`](./prisma/schema.prisma)

## 馃攲 API 璁捐

椤圭洰浣跨敤 tRPC 瀹炵幇绔埌绔被鍨嬪畨鍏ㄧ殑 API:

### User Router (`src/server/routers/user.ts`)
- `user.me` - 鑾峰彇褰撳墠鐢ㄦ埛淇℃伅
- `user.register` - 鐢ㄦ埛娉ㄥ唽

### Project Router (`src/server/routers/project.ts`)
- `project.getAll` - 鑾峰彇鐢ㄦ埛鐨勬墍鏈夐」鐩?- `project.getById` - 鑾峰彇椤圭洰璇︽儏
- `project.create` - 鍒涘缓椤圭洰
- `project.update` - 鏇存柊椤圭洰
- `project.delete` - 鍒犻櫎椤圭洰

### Task Router (`src/server/routers/task.ts`)
- `task.getByProject` - 鑾峰彇椤圭洰鐨勬墍鏈変换鍔?(鎸夌姸鎬佸垎缁?
- `task.create` - 鍒涘缓浠诲姟
- `task.update` - 鏇存柊浠诲姟
- `task.reorder` - 鎵归噺鏇存柊浠诲姟椤哄簭 (鎷栨嫿)
- `task.delete` - 鍒犻櫎浠诲姟

鎵€鏈?API 閮芥湁瀹屾暣鐨?TypeScript 绫诲瀷鎺ㄦ柇鍜?Zod 杩愯鏃舵牎楠屻€?
## 馃帹 缁勪欢搴?
椤圭洰浣跨敤 shadcn/ui,涓昏缁勪欢鍖呮嫭:

- `Button`, `Input`, `Label`, `Textarea` - 琛ㄥ崟鍩虹
- `Card` - 鍗＄墖瀹瑰櫒
- `Dialog` - 瀵硅瘽妗?妯℃€佺獥鍙?- `Select`, `DropdownMenu` - 閫夋嫨鍣?- `Avatar`, `Badge` - 鏁版嵁灞曠ず

鎵€鏈夌粍浠朵綅浜?`src/components/ui/`,鍙互鑷敱淇敼銆?
娣诲姞鏂扮粍浠?

```bash
npx shadcn@latest add dialog
npx shadcn@latest add toast
```

## 馃攼 璁よ瘉涓庢巿鏉?
### 璁よ瘉娴佺▼

1. **閭瀵嗙爜娉ㄥ唽**: `src/server/routers/user.ts` 涓殑 `register` mutation
2. **鐧诲綍**: NextAuth Credentials Provider
3. **GitHub OAuth**: NextAuth GitHub Provider
4. **浼氳瘽绠＄悊**: JWT 绛栫暐 (鏃犵姸鎬?

### 鏉冮檺鎺у埗

- **鍏紑璺敱** (`publicProcedure`): 浠讳綍浜哄彲璁块棶
- **鍙椾繚鎶よ矾鐢?* (`protectedProcedure`): 闇€瑕佺櫥褰?- **鍩轰簬瑙掕壊** (RBAC): Owner / Member / Viewer
  - Owner: 鍙垹闄ら」鐩€佺鐞嗘垚鍛?  - Member: 鍙垱寤?缂栬緫浠诲姟
  - Viewer: 鍙璁块棶

涓棿浠跺疄鐜? `src/server/trpc.ts`

## 馃殺 閮ㄧ讲

### 閮ㄧ讲鍒?Vercel (鎺ㄨ崘)

1. 鎺ㄩ€佷唬鐮佸埌 GitHub
2. 鍦?[Vercel](https://vercel.com) 瀵煎叆椤圭洰
3. 閰嶇疆鐜鍙橀噺
4. 杩炴帴 Vercel Postgres 鎴栧叾浠栨暟鎹簱
5. 杩愯鏁版嵁搴撹縼绉? `npx prisma migrate deploy`

璇︾粏姝ラ瑙?[`SETUP.md`](./SETUP.md)

### 鐜鍙橀噺

鐢熶骇鐜闇€瑕佽缃?

- `DATABASE_URL` - PostgreSQL 杩炴帴 URL
- `NEXTAUTH_URL` - 浣犵殑搴旂敤 URL
- `NEXTAUTH_SECRET` - 闅忔満瀵嗛挜
- `GITHUB_CLIENT_ID` (鍙€? - GitHub OAuth
- `GITHUB_CLIENT_SECRET` (鍙€? - GitHub OAuth

## 馃摎 鎵╁睍鏂瑰悜

椤圭洰鍙互缁х画鎵╁睍浠ヤ笅鍔熻兘:

- [ ] 浠诲姟璇勮绯荤粺 (@鎻愬強鍔熻兘)
- [ ] 鏂囦欢闄勪欢涓婁紶 (浣跨敤 Uploadthing)
- [ ] 鐪嬫澘鎷栨嫿鍔熻兘 (浣跨敤 dnd-kit) - 宸叉湁閮ㄥ垎浠ｇ爜
- [ ] 瀹炴椂閫氱煡 (WebSocket / Pusher)
- [ ] 浠诲姟鏃堕棿杩借釜
- [ ] 鑷畾涔夌湅鏉垮垪
- [ ] 瀛愪换鍔℃敮鎸?- [ ] Webhook 闆嗘垚 (Slack/Discord)
- [ ] 鏁版嵁瀵煎嚭 (CSV/PDF)
- [ ] 绉诲姩绔€傞厤浼樺寲

## 馃И 娴嬭瘯 (寰呭疄鐜?

鎺ㄨ崘鐨勬祴璇曠瓥鐣?

```bash
# 鍗曞厓娴嬭瘯 (Vitest + React Testing Library)
pnpm test

# E2E 娴嬭瘯 (Playwright)
pnpm test:e2e
```

## 馃摉 瀛︿範璧勬簮

- [Next.js 鏂囨。](https://nextjs.org/docs)
- [Prisma 鏂囨。](https://www.prisma.io/docs)
- [tRPC 鏂囨。](https://trpc.io/docs)
- [NextAuth 鏂囨。](https://next-auth.js.org)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 馃悰 甯歌闂

### Q: 绫诲瀷閿欒 "Cannot find module '@prisma/client'"

**A**: 杩愯 `npx prisma generate` 鐢熸垚 Prisma Client

### Q: 鏁版嵁搴撹縼绉诲け璐?
**A**: 鏌ョ湅 [`SETUP.md`](./SETUP.md) 鐨勫父瑙侀棶棰橀儴鍒?
### Q: tRPC 绫诲瀷涓嶆洿鏂?
**A**: 閲嶅惎 TypeScript 鏈嶅姟鍣?(VSCode: Cmd/Ctrl+Shift+P 鈫?Restart TS Server)

## 馃搫 璁稿彲璇?
MIT License

---

**馃帀 Happy Coding!** 

杩欎釜椤圭洰灞曠ず浜嗙幇浠?TypeScript 鍏ㄦ爤寮€鍙戠殑瀹屾暣宸ヤ綔娴佺▼銆傚畬鎴愬畠鍚?浣犲皢鎷ユ湁涓€涓彲浠ュ啓杩涚畝鍘嗐€佸睍绀虹粰闈㈣瘯瀹樼殑浣滃搧!