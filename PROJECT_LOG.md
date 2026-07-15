## 2026-07-15 07:55:10 +08:00 | v1.1.0-alpha.257 | 鎺ㄨ繘 FE-041 绠＄悊绔?session 鍚屾缂栨帓 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`subscribeSession(...)` 瑙﹀彂鍚庣殑鏈湴鐘舵€佸悓姝ヤ笌浼氳瘽娓呯┖鍗忓悓銆?- 鐩爣鏄妸 `session / sessionInvalidation / profile` 鏇存柊锛屼互鍙?session 琚竻绌哄悗榛樿瑙嗗浘鍥為€€銆侀敊璇竻鐞嗐€乶otice 鍚屾杩欎竴娈靛３灞傜紪鎺掓娊鍒板叡浜?helper锛岄伩鍏嶅畠缁х画鐣欏湪椤甸潰灞傚唴鑱旂淮鎶ゃ€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceSessionSync.ts` 涓?`adminWorkspaceSessionSync.test.ts`锛屾妸 session 浠嶆湁鏁堟椂鐨勬湰鍦扮姸鎬佸悓姝ワ紝浠ュ強 session 琚竻绌烘椂鐨?`reset + default view + replace URL + notice` 鍗忓悓鏀跺彛鍒板叡浜?helper銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `subscribeSession(...)` 鍥炶皟鏀逛负鐩存帴娑堣垂鍏变韩 `runAdminWorkspaceSessionSync(...)`锛岄〉闈㈠眰鍙繚鐣?ref setter 涓?location sync 缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙 session 璁㈤槄鍚庣殑鐘舵€佸悓姝ヤ笌娓呯┖鍗忓悓涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/adminWorkspaceSessionSync.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/adminWorkspaceSessionSync.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?`adminWorkspaceSessionCleared` 鎺ㄨ繘鍒板叡浜?`adminWorkspaceSessionSync`锛屽悗鍙板伐浣滃彴閲屽洿缁?session 璁㈤槄鐨勭姸鎬佸崗鍚屼篃寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｄ簡 session 鍙樺寲鍚庣殑鍚屾涓庢竻绌鸿矾寰勶紱濡傛灉鍚庣画缁х画鎺ㄨ繘 `FE-041 / ADM-010`锛屾洿閫傚悎璇勪及 `popstate + subscribe + mount` 鐨勬洿楂樺眰 runtime 鍗忚皟 helper锛岃€屼笉鏄妸鏇村 session 鍒嗘敮閲嶆柊鍐欏洖椤甸潰灞傘€?
## 2026-07-15 07:44:09 +08:00 | v1.1.0-alpha.256 | 鎺ㄨ繘 SE-020 鎼滅储鍒嗙粍缁х画鍔犺浇
### 浠诲姟鍐呭

- 閬垮厤缁х画鍦ㄥ崟涓€鍚庡彴澹冲眰閲屾繁鎸栵紝杩欎竴杞敼涓烘帹杩涙洿璐磋繎鏁寸増鍙敤鎬х殑 `SE-020` 灏忓垏鐗囷細鎶婃悳绱㈤〉鐜版湁鐨?`nextOffset` 鑳藉姏浠庘€滃崟涓€绫诲瀷绛涢€夊彲缁彇鈥濇斁寮€鍒扳€滃叏閮ㄧ被鍨嬭鍥句笅鐨勪换鎰忓垎缁勯兘鍙洿鎺ョ画鍙栤€濄€?- 鐩爣鏄湪涓嶆敼鎼滅储 API grouped contract 鐨勫墠鎻愪笅锛岃鐢ㄦ埛鍦ㄦ€昏瑙嗗浘閲屼篃鑳界洿鎺ユ妸鏌愪釜缁撴灉鍒嗙粍缁х画灞曞紑锛岃€屼笉鏄繀椤诲厛鍒囧埌鍗曚竴绫诲瀷鍐嶅姞杞芥洿澶氥€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`锛屾柊澧為〉闈㈢骇 RED/GREEN 鍥炲綊锛岄攣瀹氣€滃叏閮ㄧ被鍨嬧€濊鍥鹃噷鍥捐氨鍒嗙粍浠嶆湁 `nextOffset` 鏃讹紝鍙互鐩存帴鏄剧ず鈥滅户缁姞杞芥洿澶氬浘璋辩粨鏋溾€濆苟鎶婂悗缁粨鏋滆拷鍔犲埌褰撳墠缁勩€?- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`锛屾斁寮€ `handleLoadMore(...)` 瀵瑰崟涓€绫诲瀷瑙嗗浘鐨勯檺鍒讹紝骞惰鍒嗙粍缁х画鍔犺浇鎸夐挳鎸?`group.nextOffset !== null` 鐩存帴鍦ㄥ搴斿垎缁勫睍绀恒€?- 鍚屾鏇存柊 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/DEVELOPMENT.md` 涓?`README.md`锛屾妸鎼滅储鍒嗛〉杈圭晫浠庘€滃崟涓€绫诲瀷缁彇鈥濅慨姝ｄ负鈥滄寜鍒嗙粍鐙珛缁彇锛屼絾浠嶄笉鏄畬鏁村悗绔湡鍒嗛〉鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- 鎼滅储椤电幇鍦ㄥ湪鈥滃叏閮ㄧ被鍨嬧€濊鍥句笅涔熻兘鐩存帴鎶婃煇涓垎缁勭户缁睍寮€锛宍SE-020` 鐨?`offset / nextOffset` 鑳藉姏缁堜簬涓嶅啀鍙仠鐣欏湪鍒囨崲鍒板崟涓€绫诲瀷鍚庣殑闅愯棌鍏ュ彛銆?- 杩欎竴杞粛鐒舵病鏈夋妸 grouped search 鍗囩骇鎴愬畬鏁寸殑鏈嶅姟绔粺涓€鍒嗛〉锛涗笅涓€姝ユ洿閫傚悎琛?grouped cursor銆佹帓搴忚涔夊拰绌虹粨鏋滃缓璁紝鑰屼笉鏄洖閫€鍒版棫鐨勫崟涓€绫诲瀷缁彇闄愬埗銆?
## 2026-07-15 07:36:36 +08:00 | v1.1.0-alpha.255 | 鎺ㄨ繘 FE-041 绠＄悊绔?workspace reset controller 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼粛鐒跺唴鑱旂淮鎶ょ殑 `workspaceResetHandlers / clearWorkspaceState` 杩欎竴缁勫伐浣滃彴 reset 缂栨帓銆?- 鐩爣鏄ˉ涓€灞傚叡浜?`reset-controller` helper锛岃鍚庡彴宸ヤ綔鍙板湪鏌ヨ銆佺瓫閫夈€佸鏍告暟鎹€佹不鐞嗘暟鎹笌纭鐘舵€佺殑澶嶄綅璺緞涓婁篃澶嶇敤缁熶竴鍏ュ彛锛屽苟缁х画鎶婅鍥炬枃浠剁ǔ瀹氬帇鍦ㄤ粨搴撶害鏉熺嚎鍐呫€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceResetController.ts` 涓?`adminWorkspaceResetController.test.ts`锛屾妸宸ヤ綔鍙颁簲缁?reset 鍒囩墖鐨?handlers 缁勮鍜?`clearState(keys?)` 鍏ュ彛鏀跺彛鍒板叡浜?controller銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃椤甸潰灞傛敼涓虹洿鎺ユ秷璐瑰叡浜?`workspaceResetController`锛屼笉鍐嶅湪瑙嗗浘閲岀淮鎶や竴鏁存 reset handlers 涓庢竻鐞嗙紪鎺掋€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙 workspace reset 涔熷凡杩涘叆鍏变韩 controller helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceResetController.test.ts src/views/AdminWorkspaceView.test.ts src/views/adminWorkspaceState.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜‘璁ょ紪鎺?controller 鎺ㄨ繘鍒板叡浜?workspace reset controller锛屽悗鍙板伐浣滃彴澹冲眰閲岀殑 reset 璺緞杩涗竴姝ュ彉钖勶紝`AdminWorkspaceView.vue` 涔熺户缁敹鍙ｅ埌 787 琛屻€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙?reset 缁勫悎鍏ュ彛锛涙洿杩涗竴姝ョ殑娌荤悊鍔ㄤ綔鍖呰銆佸伐浣滃彴 feature adapter 涓?page/feature 杈圭晫锛屼粛閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹杩涖€?
## 2026-07-15 07:31:30 +08:00 | v1.1.0-alpha.254 | 鎺ㄨ繘 FE-041 绠＄悊绔‘璁ょ紪鎺?controller helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼粛鐒跺垎鏁ｇ淮鎶ょ殑浜旂粍纭寮瑰眰缂栨帓銆?- 鐩爣鏄ˉ涓€灞傚叡浜?`confirm-controller` helper锛岃鍚庡彴宸ヤ綔鍙板湪纭娴佷笂鐨?`dialogs / reset / submit` 缁勫悎鍏ュ彛缁х画澶嶇敤缁熶竴鍑哄彛锛屽苟鎶婅秴鍑?800 琛岀殑瑙嗗浘鏂囦欢鍘嬪洖浠撳簱绾︽潫鍐呫€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceConfirmController.ts` 涓?`adminWorkspaceConfirmController.test.ts`锛屾敹鍙ｄ簲缁勭‘璁ゅ脊灞傜殑 dialog 缁勮銆乺eset handler 澶嶇敤鍜?submit handler 鍒嗗彂銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃椤甸潰灞傛敼涓烘秷璐瑰叡浜?`confirmController`锛屼笉鍐嶅湪瑙嗗浘閲屽唴鑱旀暣娈电‘璁ょ紪鎺掋€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙纭缂栨帓涔熷凡杩涘叆鍏变韩 controller helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceConfirmController.test.ts src/views/AdminWorkspaceView.test.ts src/views/adminWorkspaceConfirmState.test.ts src/views/adminWorkspaceConfirmDialogs.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜櫥褰曢潰鏉夸簨浠惰閰嶉摼鎺ㄨ繘鍒板叡浜‘璁ょ紪鎺?controller锛屽悗鍙板伐浣滃彴澹冲眰閲屾畫鐣欑殑纭娴佺粍瑁呰繘涓€姝ュ彉钖勶紝`AdminWorkspaceView.vue` 涔熷凡鍥炲埌 800 琛屼互鍐呫€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｇ‘璁ょ紪鎺掓渶灏忕粍鍚堝叆鍙ｏ紱鏇磋繘涓€姝ョ殑 `workspaceResetHandlers`銆佹洿瀹屾暣鐨勫伐浣滃彴 feature adapter 涓庢不鐞嗘ā鍧?page/feature 杈圭晫锛屼粛閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹杩涖€?## 2026-07-14 02:08:34 +08:00 | v1.1.0-alpha.238 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞?props 瑁呴厤 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼紶缁?`AdminShellFrame` 鐨勫３灞?props 瑁呴厤閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?shell-props helper锛岃鍚庡彴宸ヤ綔鍙板３灞傝緭鍏ョ户缁鐢ㄧ粺涓€鍑哄彛锛岃€屼笉鏄妸杩欏眰妯℃澘绾ч珮棰?props 缁戝畾缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceShellProps.ts` 涓?`adminWorkspaceShellProps.test.ts`锛屾敹鍙?active view銆佹弿杩般€佽鏁般€乶av groups銆乶otice銆乴oading銆乸rofile 绛夊３灞?props 鐨勮閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `AdminShellFrame` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceShellProps` helper锛岄〉闈㈠眰鍙繚鐣?state銆乧omputed 鏁版嵁婧愪笌 helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙澹冲眰 props 涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceShellProps.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜ā鍧椾簨浠惰閰嶉摼鎺ㄨ繘鍒板叡浜３灞?props 瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙版ā鏉垮眰閲岀殑楂橀杈撳叆缁戝畾杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?shell-props helper锛涙洿杩涗竴姝ョ殑鐧诲綍闈㈡澘 props 鎴栨洿瀹屾暣鐨勫３灞?feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 02:00:43 +08:00 | v1.1.0-alpha.237 | 鎺ㄨ繘 FE-041 绠＄悊绔ā鍧椾簨浠惰閰?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?dashboard / moderation / governance 涓夌粍妯″潡浜嬩欢鐨勮浆鍙戦€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?module-events helper锛岃鍚庡彴宸ヤ綔鍙扮殑妯″潡浜嬩欢缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欏眰妯″潡绾?event binding 缂栨帓缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceModuleEvents.ts` 涓?`adminWorkspaceModuleEvents.test.ts`锛屾敹鍙?dashboard 鎵撳紑瀹℃牳銆乵oderation 鍔ㄤ綔/绛涢€夛紝浠ュ強 governance 鍔ㄤ綔/閫変腑/绛涢€変簨浠剁殑杞彂銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 dashboard / moderation / governance 涓夌粍妯″潡浜嬩欢鏀逛负娑堣垂鍏变韩 `adminWorkspaceModuleEvents` helper锛岄〉闈㈠眰鍙繚鐣?state銆乤ction 鍑芥暟涓?helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙妯″潡浜嬩欢涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceModuleEvents.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜ā鍧?props 瑁呴厤閾炬帹杩涘埌鍏变韩妯″潡浜嬩欢瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙板３灞傞噷鐨勬ā鍧楃骇 event binding 缂栨帓杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?module-events helper锛涙洿杩涗竴姝ョ殑妯″潡绾?feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:56:14 +08:00 | v1.1.0-alpha.236 | 鎺ㄨ繘 FE-041 绠＄悊绔ā鍧?props 瑁呴厤 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?dashboard / moderation / governance 涓夌粍妯″潡 props 鐨勮閰嶉€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?module-props helper锛岃鍚庡彴宸ヤ綔鍙扮殑妯″潡杈撳叆缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欏眰妯″潡绾?binding 缂栨帓缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceModuleProps.ts` 涓?`adminWorkspaceModuleProps.test.ts`锛屾敹鍙?dashboard 缁熻鍗°€乵oderation 鍒楄〃 props锛屼互鍙?governance 鍔ㄤ綔/绌烘€?绛涢€?props 鐨勮閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 dashboard / moderation / governance 涓夌粍妯″潡 props 鏀逛负娑堣垂鍏变韩 `adminWorkspaceModuleProps` helper锛岄〉闈㈠眰鍙繚鐣?state銆乧omputed 鏁版嵁婧愪笌浜嬩欢缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙妯″潡 props 涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceModuleProps.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜‘璁ゅ脊灞傝閰嶉摼鎺ㄨ繘鍒板叡浜ā鍧?props 瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙板３灞傞噷鐨勬ā鍧楃骇 binding 缂栨帓杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?module-props helper锛涙洿杩涗竴姝ョ殑妯″潡绾?feature adapter 鎴栦簨浠惰閰嶏紝浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:49:58 +08:00 | v1.1.0-alpha.235 | 鎺ㄨ繘 FE-041 绠＄悊绔‘璁ゅ脊灞傝閰?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?5 缁勭‘璁ゅ脊灞傜殑 copy 瑙ｆ瀽涓?dialog metadata 瑁呴厤閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?confirm-dialog assembly helper锛岃鍚庡彴宸ヤ綔鍙扮殑纭鏂囨涓?dialog stack 缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欏眰 computed / copy 缂栨帓缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceConfirmDialogs.ts` 涓?`adminWorkspaceConfirmDialogs.test.ts`锛屾敹鍙?moderation銆乺eport銆乤iTask銆乼emplate銆乽ser 浜旂粍 pending state 鍒板叡浜?dialog stack 鐨勮閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃纭寮瑰眰浠庣洿鎺ョ淮鎶?5 缁?copy computed 涓?`buildAdminConfirmDialogs(...)` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceConfirmDialogs` helper锛岄〉闈㈠眰鍙繚鐣?pending state銆乪rror state 涓?helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙纭寮瑰眰 copy / dialog metadata 涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceConfirmDialogs.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜緟纭鍔ㄤ綔鎵撳紑閾炬帹杩涘埌鍏变韩纭寮瑰眰瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙板３灞傞噷鐨?confirm copy/computed 缂栨帓杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?confirm-dialog assembly helper锛涙洿杩涗竴姝ョ殑妯″潡绾?feature adapter 鎴栨ā鍧?props 瑁呴厤锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:43:00 +08:00 | v1.1.0-alpha.234 | 鎺ㄨ繘 FE-041 绠＄悊绔緟纭鍔ㄤ綔 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`requestModerationAction(...)` 涓?`requestGovernanceAction(...)` 杩欑粍 pending action 鎵撳紑閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?pending-action helper锛岃鍚庡彴宸ヤ綔鍙扮殑纭鍓嶆墦寮€璺緞缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欏眰 request/open 缂栨帓缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspacePendingAction.ts` 涓?`adminWorkspacePendingAction.test.ts`锛屾敹鍙?moderation 鎵撳紑銆佹不鐞嗗姩浣滃垎鍙戝埌 report/material 璺緞锛屼互鍙?invalid dispatch 鐨勯敊璇洖鍐欍€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `requestModerationAction(...)` 涓?`requestGovernanceAction(...)` 鏀逛负娑堣垂鍏变韩 `adminWorkspacePendingAction` helper锛岄〉闈㈠眰鍙繚鐣?pending state銆乪rror state 鍜屽叡浜?helper 鐨勫弬鏁扮粦瀹氥€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙寰呯‘璁ゅ姩浣滄墦寮€閾句篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspacePendingAction.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜‘璁ょ姸鎬侀摼鎺ㄨ繘鍒板叡浜緟纭鍔ㄤ綔鎵撳紑閾撅紝鍚庡彴宸ヤ綔鍙板３灞傞噷鐨?request/open 缂栨帓杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?pending-action helper锛涙洿杩涗竴姝ョ殑 confirm dialog copy/computed 缁勮涓庢ā鍧楃骇 feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:36:00 +08:00 | v1.1.0-alpha.233 | 鎺ㄨ繘 FE-041 绠＄悊绔‘璁ょ姸鎬?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲岀‘璁ゅ脊灞?reset/submit 鏄犲皠琛ㄨ繖娈典粛鐩存帴缁存姢鐨勫３灞傜紪鎺掋€?- 鐩爣鏄ˉ涓€灞傚叡浜?confirm-state helper锛岃鍚庡彴宸ヤ綔鍙扮殑纭寮瑰眰閲嶇疆涓庢寜 key 鎻愪氦娴佺▼缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欑粍鏄犲皠琛ㄧ户缁暀鍦ㄥ３灞傜粍浠堕噷銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceConfirmState.ts` 涓?`adminWorkspaceConfirmState.test.ts`锛屾敹鍙ｇ‘璁ゅ脊灞傜殑 reset/submit 鏄犲皠琛ㄥ拰 pending 涓虹┖鏃剁殑 noop 閫昏緫銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `confirmResetHandlers` 涓?`confirmSubmitHandlers` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceConfirmState` helper锛岄〉闈㈠眰鍙繚鐣?pending state銆乪rror state 鍜岀湡瀹炲姩浣滃嚱鏁般€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙纭鐘舵€侀摼涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceConfirmState.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗗姩浣滅姸鎬侀摼鎺ㄨ繘鍒板叡浜‘璁ょ姸鎬侀摼锛屽悗鍙板伐浣滃彴澹冲眰閲岀殑 confirm 缂栨帓杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?confirm-state helper锛涙洿杩涗竴姝ョ殑 pending action open state 涓庢ā鍧楃骇 feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:28:00 +08:00 | v1.1.0-alpha.232 | 鎺ㄨ繘 FE-041 绠＄悊绔不鐞嗗姩浣滅姸鎬?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?moderation/governance 鍔ㄤ綔鎻愪氦鏃朵粛鐩存帴缁存姢鐨?loading銆乶otice銆乧onfirm error銆?09 conflict 涓?reload 缂栨帓銆?- 鐩爣鏄ˉ涓€灞傚叡浜?mutation-state helper锛岃鍚庡彴宸ヤ綔鍙扮殑娌荤悊鍔ㄤ綔鐘舵€佸垏鎹㈢户缁鐢ㄧ粺涓€鍑哄彛锛岃€屼笉鏄妸杩欎簺鍓綔鐢ㄧ紪鎺掔户缁暀鍦ㄥ３灞傜粍浠堕噷銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceMutationState.ts` 涓?`adminWorkspaceMutationState.test.ts`锛屾敹鍙?moderation/governance 鍔ㄤ綔鎻愪氦鏃剁殑 loading銆乶otice銆乧onfirm error銆?09 conflict 涓?reload 鐘舵€佺紪鎺掋€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `applyModerationAction(...)` 涓?`applyGovernanceRecordAction(...)` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceMutationState` helper锛岄〉闈㈠眰鍙繚鐣?state 缁戝畾鍜?request adapter銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙娌荤悊鍔ㄤ綔鐘舵€侀摼涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceMutationState.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜暟鎹姞杞介摼鎺ㄨ繘鍒板叡浜不鐞嗗姩浣滅姸鎬侀摼锛屽悗鍙板伐浣滃彴澹冲眰閲岀殑鍔ㄤ綔鍓綔鐢ㄨ繘涓€姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?mutation-state helper锛涙洿杩涗竴姝ョ殑纭寮瑰眰 open/reset state 涓庢ā鍧楃骇 feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 01:20:00 +08:00 | v1.1.0-alpha.231 | 鎺ㄨ繘 FE-041 绠＄悊绔暟鎹姞杞?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼粛鐩存帴缁存姢鐨?`refreshProfile()`銆乣loadOverview()`銆乣loadModeration()`銆乣loadGovernance()` 鍥涙潯璇诲彇/鍔犺浇閾捐矾銆?- 鐩爣鏄ˉ涓€灞傚叡浜?data-load helper锛岃鍚庡彴宸ヤ綔鍙扮殑鏁版嵁璇诲彇銆佸壇浣滅敤鐘舵€佸垏鎹笌 403 娓呯┖瑙勫垯缁х画澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄妸杩欎簺璇锋眰鍒嗘敮缁х画鐣欏湪澹冲眰缁勪欢閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceDataLoad.ts` 涓?`adminWorkspaceDataLoad.test.ts`锛屾敹鍙?profile/overview 绠€鍗曡鍙栵紝浠ュ強 moderation/governance 鐨?loading銆乪rror銆?03 娓呯┖銆佸悓 view 鍒锋柊淇濈暀鏃ф暟鎹瓑琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `refreshProfile()`銆乣loadOverview()`銆乣loadModeration()`銆乣loadGovernance()` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceDataLoad` helper锛岄〉闈㈠眰鍙繚鐣?state 缁戝畾鍜?request adapter銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鍓╀綑鏁版嵁鍔犺浇閾句篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceDataLoad.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?lifecycle / refresh / popstate 鎵ц閾炬帹杩涘埌鍏变韩鏁版嵁鍔犺浇閾撅紝鍚庡彴宸ヤ綔鍙板３灞傞噷鐨勮鍙栧壇浣滅敤杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?data-load helper锛涙洿杩涗竴姝ョ殑纭寮瑰眰鐘舵€併€佹不鐞嗗姩浣?state adapter 涓?page / feature 杈圭晫锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 00:17:34 +08:00 | v1.1.0-alpha.230 | 鎺ㄨ繘 FE-041 绠＄悊绔?popstate 鎵ц helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`handleAdminPopstate()` 杩欐潯娴忚鍣ㄥ悗閫€/鍓嶈繘瑙﹀彂鏃朵粛鐩存帴缁存姢鏌ヨ閲嶇疆銆佺洰鏍?view 搴旂敤涓庢寜闇€鍔犺浇椤哄簭鐨勫３灞傚叆鍙ｃ€?- 鐩爣鏄ˉ涓€灞傚叡浜?popstate execution helper锛岃鍚庡彴宸ヤ綔鍙板湪娴忚鍣?`popstate` 鍒囨崲鍒扮洰鏍囩鐞嗚矾寰勬椂锛屼篃澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄户缁妸杩欐潯鎵ц閾剧暀鍦ㄧ粍浠跺眰銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspacePopstate.ts` 涓?`adminWorkspacePopstate.test.ts`锛屾敹鍙ｆ祻瑙堝櫒 `popstate` 瑙﹀彂鏃剁殑鏌ヨ閲嶇疆銆佺洰鏍?view 搴旂敤涓庢寜闇€鍔犺浇椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃ˉ涓€鏉￠〉闈㈢骇鍥炲綊锛岄攣瀹氭祻瑙堝櫒璺緞閫氳繃 `popstate` 鍒囧埌 `/admin/audit` 鏃朵細閲嶆柊鍔犺浇鐩爣娌荤悊妯″潡銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `handleAdminPopstate()` 鏀逛负娑堣垂鍏变韩 `runAdminWorkspacePopstate(...)` helper锛岃€屼笉鏄户缁洿鎺ョ淮鎶?reset / set view / load 鐨勬墽琛屽彛銆?- 鏈疆涓嶆敼 URL 瑙ｆ瀽鍗忚銆佹不鐞嗚姹傚疄鐜版垨 session 鍗忚锛屽彧鎶婂凡绋冲畾鐨勬祻瑙堝櫒瀵艰埅鎵ц閾剧户缁粠澹冲眰缁勪欢涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspacePopstate.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?refresh execution 鎺ㄨ繘鍒板叡浜?popstate execution锛屽悗鍙板伐浣滃彴鍦ㄦ祻瑙堝櫒鍚庨€€/鍓嶈繘鍒囨崲璺緞鏃朵篃寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?popstate helper锛涙洿杩涗竴姝ョ殑 `loadActiveView(...)` 涓庢洿娣卞眰鍔犺浇鍗忚皟鍣紝浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 00:12:04 +08:00 | v1.1.0-alpha.229 | 鎺ㄨ繘 FE-041 绠＄悊绔埛鏂版墽琛?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`refreshActiveView()` 杩欐潯浠嶇洿鎺ュ唴鑱旇皟鐢ㄥ綋鍓?active view 鍒锋柊鐨勫３灞傚叆鍙ｃ€?- 鐩爣鏄ˉ涓€灞傚叡浜?refresh plan 涓?refresh execution helper锛岃鍚庡彴宸ヤ綔鍙颁粠椤堕儴鈥滃埛鏂版暟鎹€濆叆鍙ｈЕ鍙戝綋鍓嶈鍥鹃噸杞芥椂锛屼篃澶嶇敤缁熶竴鍑哄彛锛岃€屼笉鏄户缁妸杩欐鎵ц鍙ｇ暀鍦ㄧ粍浠跺眰銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/views/adminWorkspaceLifecycle.ts` 涓?`adminWorkspaceLifecycle.test.ts`锛屾柊澧炲叡浜?`buildAdminWorkspaceRefreshPlan(...)`锛屾妸褰撳墠 active view 鐨勫埛鏂拌鍒掔撼鍏ョ粺涓€ lifecycle 鍑哄彛銆?- 鏂板 `frontend-admin/src/views/adminWorkspaceRefresh.ts` 涓?`adminWorkspaceRefresh.test.ts`锛屾敹鍙ｅ埛鏂版椂鏄惁瑙﹀彂褰撳墠瑙嗗浘閲嶈浇鐨勬渶灏忔墽琛岄摼銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `refreshActiveView()` 鏀逛负娑堣垂鍏变韩 refresh plan 涓?refresh helper锛岃€屼笉鏄户缁洿鎺ヨ皟鐢?`loadActiveView(activeView.value)`銆?- 鏈疆涓嶆敼瀹℃牳/娌荤悊鍔犺浇鍗忚銆乁RL 璇箟鎴?session 鍗忚锛屽彧鎶婂凡绋冲畾鐨勫埛鏂板３灞傚叆鍙ｇ户缁粠缁勪欢灞備笅娌夊埌鍏变韩 helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLifecycle.test.ts src/views/adminWorkspaceRefresh.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?logout execution 鎺ㄨ繘鍒板叡浜?refresh plan / execution锛屽悗鍙板伐浣滃彴椤堕儴鈥滃埛鏂版暟鎹€濆叆鍙ｄ篃寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?refresh helper锛涙洿杩涗竴姝ョ殑 `loadActiveView(...)` 鍗忚皟鍣ㄥ強鍏舵洿娣卞眰鍔犺浇瀹炵幇锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-14 00:04:12 +08:00 | v1.1.0-alpha.228 | 鎺ㄨ繘 FE-041 绠＄悊绔€€鍑烘墽琛?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`logout()` 鍦ㄩ€€鍑烘椂浠嶅唴鑱旂淮鎶ょ殑 session/profile 娓呯悊銆佸伐浣滃彴 reset銆侀粯璁?view 鍥為€€銆佹棤鏁堝寲鎻愮ず娓呯┖銆佹寔涔呭寲浼氳瘽娓呴櫎涓庨€€鍑烘彁绀哄悓姝ャ€?- 鐩爣鏄ˉ涓€灞傚叡浜?logout execution helper锛屽苟璁╁悗鍙板伐浣滃彴鍦ㄩ€€鍑烘椂鐨勬渶灏忔墽琛岄摼澶嶇敤缁熶竴鍑哄彛锛屽悓鏃舵妸鈥滃悗鍙颁細璇濆凡娓呯┖銆傗€濇彁绀虹ǔ瀹氬甫鍥炵櫥褰曟€佽鍥俱€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLogout.ts` 涓?`adminWorkspaceLogout.test.ts`锛屾敹鍙?`runAdminWorkspaceLogout(...)` 鍑哄彛锛岀粺涓€澶勭悊閫€鍑烘椂鐨?session/profile 娓呯悊銆佸伐浣滃彴 reset銆侀粯璁?view 鍥為€€銆佹棤鏁堝寲鎻愮ず娓呯┖銆佹寔涔呭寲浼氳瘽娓呴櫎涓?notice 鍚屾椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `logout()` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceLogout` helper锛屽苟琛ヤ笂鐧诲綍鎬?`notice` 閫忎紶閫昏緫锛岄伩鍏嶉€€鍑哄悗鎻愮ず涓㈠け銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminLoginPanel.vue` 涓?`AdminLoginPanel.test.ts`锛屼负鐧诲綍鎬佽鍥捐ˉ鍏呴潪閿欒鍨?notice 灞曠ず鍑哄彛銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙閫€鍑烘墽琛屼篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLogout.test.ts src/views/AdminWorkspaceView.test.ts src/components/admin/AdminLoginPanel.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠?view-switch execution 鎺ㄨ繘鍒板叡浜?logout execution锛屽悗鍙板伐浣滃彴鍦ㄩ€€鍑烘椂鐨勬竻鐞嗐€佸洖閫€鍜屾彁绀哄紑濮嬪鐢ㄧ粺涓€鍑哄彛锛岀櫥褰曟€侀〉闈篃涓嶅啀涓㈠け閫€鍑烘彁绀恒€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?logout helper锛涙洿杩涗竴姝ョ殑 `refreshActiveView()` 鍏变韩鍒锋柊璁″垝锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 23:55:37 +08:00 | v1.1.0-alpha.227 | 鎺ㄨ繘 FE-041 绠＄悊绔鍥惧垏鎹㈡墽琛?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`switchView(...)` 鍦ㄥ鑸垏鎹㈡椂浠嶅唴鑱旂淮鎶ょ殑宸ヤ綔鍙?reset銆佺洰鏍?view 搴旂敤銆乁RL push 涓庢寜闇€鍔犺浇椤哄簭銆?- 鐩爣鏄ˉ涓€灞傚叡浜?view-switch execution helper锛屽苟璁╁悗鍙板伐浣滃彴鍦ㄥ鑸垏鎹㈡椂鐨勬渶灏忔墽琛岄摼澶嶇敤缁熶竴鍑哄彛锛屽噺灏戠粍浠剁户缁墜鍐欒繖娈电ǔ瀹氱紪鎺掋€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceViewSwitch.ts` 涓?`adminWorkspaceViewSwitch.test.ts`锛屾敹鍙?`runAdminWorkspaceViewSwitch(...)` 鍑哄彛锛岀粺涓€澶勭悊瑙嗗浘鍒囨崲鏃剁殑宸ヤ綔鍙?reset銆佺洰鏍?view 搴旂敤銆乁RL push/replace 涓庢寜闇€鍔犺浇椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `switchView(...)` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceViewSwitch` helper锛岃€屼笉鏄户缁湪缁勪欢閲屽唴鑱旇繖娈垫墽琛岄摼銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙瑙嗗浘鍒囨崲鎵ц涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceViewSwitch.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠?session-cleared execution 鎺ㄨ繘鍒板叡浜?view-switch execution锛屽悗鍙板伐浣滃彴鍦ㄥ鑸垏鎹㈡椂鐨?reset銆乁RL push 鍜屾寜闇€鍔犺浇寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?view-switch helper锛涙洿杩涗竴姝ョ殑 `refreshActiveView()` 鍏变韩鍒锋柊璁″垝锛屾垨 logout 鍒嗘敮鐨勬墽琛岄摼锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 23:48:01 +08:00 | v1.1.0-alpha.226 | 鎺ㄨ繘 FE-041 绠＄悊绔細璇濇竻绌烘墽琛?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`subscribeSession(...)` 鍦ㄤ細璇濊娓呯┖鏃朵粛鍐呰仈缁存姢鐨勫伐浣滃彴 reset銆侀粯璁?view 鍥為€€銆乁RL replace銆侀敊璇竻鐞嗕笌鎻愮ず鍚屾銆?- 鐩爣鏄ˉ涓€灞傚叡浜?session-cleared execution helper锛屽苟璁╁悗鍙板伐浣滃彴鍦ㄤ細璇濆け鏁堟垨琚姩娓?session 鍚庣殑鏈€灏忓洖閫€椤哄簭澶嶇敤缁熶竴鍑哄彛锛屽噺灏戠粍浠剁户缁墜鍐欒繖娈电ǔ瀹氱紪鎺掋€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceSessionCleared.ts` 涓?`adminWorkspaceSessionCleared.test.ts`锛屾敹鍙?`runAdminWorkspaceSessionCleared(...)` 鍑哄彛锛岀粺涓€澶勭悊浼氳瘽琚竻绌哄悗鐨勫伐浣滃彴 reset銆侀粯璁?view 鍥為€€銆乁RL replace銆侀敊璇竻鐞嗕笌 notice 鍚屾椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `subscribeSession(...)` 涓殑 session-cleared 鍒嗘敮鏀逛负娑堣垂鍏变韩 `adminWorkspaceSessionCleared` helper锛岃€屼笉鏄户缁湪缁勪欢閲屽唴鑱旇繖娈垫墽琛岄摼銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙浼氳瘽娓呯┖鎵ц涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceSessionCleared.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庢寕杞借嚜涓炬墽琛屾帹杩涘埌鍏变韩 session-cleared execution锛屽悗鍙板伐浣滃彴鍦ㄤ細璇濆け鏁堛€乺efresh 澶辫触鎴?`user_disabled` 绛夎鍔ㄦ竻 session 鍦烘櫙涓嬬殑 reset銆佸洖閫€涓庢彁绀哄紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?session-cleared helper锛涙洿杩涗竴姝ョ殑 `refreshActiveView()` 鍏变韩鍒锋柊璁″垝锛屾垨 session 鍙樺寲涓嬪叾浣欏崗璋冮€昏緫锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 22:25:40 +08:00 | v1.1.0-alpha.225 | 鎺ㄨ繘 FE-041 绠＄悊绔寕杞借嚜涓?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屾寕杞芥椂浠嶅唴鑱旂淮鎶ょ殑鐩爣 view 搴旂敤銆乸rofile 鍒锋柊涓庡垵濮?view 鍔犺浇椤哄簭銆?- 鐩爣鏄ˉ涓€灞傚叡浜?mount bootstrap helper锛屽苟璁╁悗鍙板伐浣滃彴鎸傝浇鏃剁殑鏈€灏忔墽琛岄『搴忓鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鎵嬪啓杩欐绋冲畾娴佺▼銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceMountBootstrap.ts` 涓?`adminWorkspaceMountBootstrap.test.ts`锛屾敹鍙?`runAdminWorkspaceMountBootstrap(...)` 鍑哄彛锛岀粺涓€澶勭悊鎸傝浇鏃剁殑鐩爣 view 搴旂敤銆乸rofile 鍒锋柊涓庡垵濮?view 鍔犺浇椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `onMounted()` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceMountBootstrap` helper锛岃€屼笉鏄户缁湪缁勪欢閲岀洿鎺ヤ覆鑱旀寕杞芥椂鐨勮嚜涓炬墽琛屾楠ゃ€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鎸傝浇鑷妇鎵ц涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceMountBootstrap.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗗姩浣滄彁浜ゆ祦绋嬫帹杩涘埌鍏变韩鎸傝浇鑷妇鎵ц锛屽悗鍙板伐浣滃彴鎸傝浇鏃剁殑鐩爣 view 搴旂敤銆乸rofile 鍒锋柊涓庡垵濮?view 鍔犺浇椤哄簭寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?mount bootstrap helper锛涙洿杩涗竴姝ョ殑 active view 鍒锋柊璁″垝涓?session 鍙樻洿鍗忓悓浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 22:21:20 +08:00 | v1.1.0-alpha.224 | 鎺ㄨ繘 FE-041 绠＄悊绔不鐞嗗姩浣滄彁浜ゆ祦绋?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽洓缁勬不鐞嗗姩浣滄彁浜ゅ悗浠嶅唴鑱旂淮鎶ょ殑鎵ц璇锋眰銆乨ialog reset銆佹不鐞嗚鍥惧洖鍒蜂笌 conflict 鍒嗘敮銆?- 鐩爣鏄ˉ涓€灞傚叡浜?governance mutation flow helper锛屽苟璁╁悗鍙版不鐞嗗姩浣滅殑鏈€灏忔彁浜ょ紪鎺掑鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鎵嬪啓杩欐绋冲畾娴佺▼銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminGovernanceMutationFlow.ts` 涓?`adminGovernanceMutationFlow.test.ts`锛屾敹鍙?`runAdminGovernanceMutation(...)` 鍑哄彛锛岀粺涓€澶勭悊娌荤悊鍔ㄤ綔鐨勬彁浜よ姹傘€乨ialog reset銆乺eload view 涓?409 conflict 淇″彿銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `applyGovernanceRecordAction(...)` 鏀逛负娑堣垂鍏变韩 `adminGovernanceMutationFlow` helper锛岃€屼笉鏄户缁湪缁勪欢閲岀洿鎺ヤ覆鑱?mutation meta銆佹彁浜よ姹傚拰娌荤悊瑙嗗浘鍥炲埛銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙娌荤悊鍔ㄤ綔鎻愪氦娴佺▼涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceMutationFlow.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜鏍稿姩浣滃厓鏁版嵁鎺ㄨ繘鍒板叡浜不鐞嗗姩浣滄彁浜ゆ祦绋嬶紝鍚庡彴娌荤悊鍔ㄤ綔鐨勮姹傛墽琛屻€乨ialog reset銆佹不鐞嗚鍥惧洖鍒蜂笌 conflict 淇″彿寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?governance mutation flow helper锛涙洿杩涗竴姝ョ殑 mount/read 鍗忚皟涓?active view 鍒锋柊璁″垝浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 22:15:50 +08:00 | v1.1.0-alpha.223 | 鎺ㄨ繘 FE-041 绠＄悊绔鏍稿姩浣滃厓鏁版嵁 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽鏍稿姩浣滄彁浜ゅ悗浠嶅唴鑱旂淮鎶ょ殑 path 鎷兼帴銆佹垚鍔熸彁绀轰笌璧勬枡娌荤悊鐗逛緥鍒嗘敮銆?- 鐩爣鏄ˉ涓€灞傚叡浜?moderation mutation helper锛屽苟璁╁悗鍙板鏍稿姩浣滅殑鏈€灏忔彁浜ゅ厓鏁版嵁澶嶇敤缁熶竴鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鎵嬪啓杩欐绋冲畾鍒嗘敮銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminModerationMutationMeta.ts` 涓?`adminModerationMutationMeta.test.ts`锛屾敹鍙?`resolveAdminModerationMutationMeta(...)` 鍑哄彛锛岀粺涓€澶勭悊瀹℃牳鍔ㄤ綔鐨?API path銆佹垚鍔熸彁绀恒€佽祫鏂欐不鐞嗗洖鍒蜂笌 409 conflict 鐗逛緥銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `applyModerationAction(...)` 鏀逛负娑堣垂鍏变韩 `adminModerationMutationMeta` helper锛岃€屼笉鏄户缁湪缁勪欢閲岀洿鎺ョ淮鎶?path銆乶otice 鍜岃祫鏂欐不鐞嗙壒鍒ゃ€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙瀹℃牳鍔ㄤ綔鍏冩暟鎹篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminModerationMutationMeta.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜櫥褰曡嚜涓鹃『搴忔帹杩涘埌鍏变韩瀹℃牳鍔ㄤ綔鍏冩暟鎹紝鍚庡彴瀹℃牳鍔ㄤ綔鐨?path銆佹垚鍔熸彁绀轰笌璧勬枡娌荤悊鐗逛緥寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?moderation mutation helper锛涙洿杩涗竴姝ョ殑娌荤悊鍔ㄤ綔鍒锋柊缂栨帓涓?mount/read 鍗忚皟浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 22:08:40 +08:00 | v1.1.0-alpha.222 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴鐧诲綍鑷妇 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲岀櫥褰曟垚鍔熷悗浠嶅唴鑱旂淮鎶ょ殑 session 鎸佷箙鍖栥€乸rofile 鍒锋柊涓庡綋鍓?view 鍔犺浇椤哄簭銆?- 鐩爣鏄ˉ涓€灞傚叡浜?bootstrap helper锛屽苟璁╁悗鍙扮櫥褰曟垚鍔熷悗鐨勬渶灏忚嚜涓鹃摼璺鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鎵嬪啓杩欐绋冲畾缂栨帓銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceBootstrap.ts` 涓?`adminWorkspaceBootstrap.test.ts`锛屾敹鍙?`runAdminWorkspaceLoginBootstrap(...)` 鍑哄彛锛岀粺涓€澶勭悊鐧诲綍鎴愬姛鍚庣殑 session 鎸佷箙鍖栥€乸rofile 鍒锋柊涓庡綋鍓?view 鍔犺浇椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `login()` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceBootstrap` helper锛岃€屼笉鏄户缁湪缁勪欢閲岀洿鎺ヤ覆鑱旂櫥褰曞悗鐨勮嚜涓炬楠ゃ€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃ˉ涓€鏉″悗鍙扮櫥褰曟垚鍔熷悗 dashboard 鏁版嵁浼氬畬鎴愯嚜涓惧姞杞界殑椤甸潰绾у洖褰掋€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鐧诲綍鎴愬姛鍚庣殑宸ヤ綔鍙拌嚜涓句篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceBootstrap.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜鍥惧姞杞界紪鎺掓帹杩涘埌鍏变韩鐧诲綍鑷妇椤哄簭锛屽悗鍙扮櫥褰曟垚鍔熷悗鐨?session 鎸佷箙鍖栥€乸rofile 鍒锋柊涓庡綋鍓?view 鍔犺浇寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?login bootstrap helper锛涙洿杩涗竴姝ョ殑 mount/read 鍗忚皟涓庢不鐞嗘彁浜ゅ悗鐨勫埛鏂扮紪鎺掍粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 22:00:10 +08:00 | v1.1.0-alpha.221 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴鍔犺浇缂栨帓 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?dashboard銆乵oderation 鍜?governance 涓夌被瑙嗗浘鐨勫姞杞界紪鎺掑垎鏀€?- 鐩爣鏄ˉ涓€涓叡浜?view-load helper锛屽苟璁?overview/moderation/governance 鐨勮皟搴﹀鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鐩存帴缁存姢杩欑粍鍔犺浇鍒嗗弶銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceViewLoad.ts` 涓?`adminWorkspaceViewLoad.test.ts`锛屾敹鍙?`runAdminWorkspaceViewLoad(...)` 鍑哄彛锛岀粺涓€澶勭悊 dashboard銆乵oderation 鍜?governance 涓夌被瑙嗗浘鐨勫姞杞借皟搴︺€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `loadActiveView(...)` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceViewLoad` helper锛岃€屼笉鏄户缁湪缁勪欢閲屽唴鑱?`Promise.all(...)` 鍜岃鍥惧垎鏀€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙瑙嗗浘绾у姞杞界紪鎺掍篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceViewLoad.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜敓鍛藉懆鏈熻鍒掓帹杩涘埌鍏变韩瑙嗗浘鍔犺浇缂栨帓锛宒ashboard銆乵oderation 鍜?governance 鐨勮皟搴﹀紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?view-load helper锛涙洿杩涗竴姝ョ殑 bootstrap/read 鍗忚皟涓庣櫥褰?娌荤悊鎻愪氦缂栨帓浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 21:56:40 +08:00 | v1.1.0-alpha.220 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴鐢熷懡鍛ㄦ湡 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屾寕杞借嚜涓俱€乣popstate`銆佸鑸垏鎹€佷細璇濆け鏁堝洖閫€鍜岄€€鍑鸿繖鍑犵被绋冲畾鐨勫伐浣滃彴鐢熷懡鍛ㄦ湡鍒嗘敮銆?- 鐩爣鏄ˉ涓€涓叡浜?lifecycle helper锛屽苟璁?reset/sync/load 璁″垝閮藉鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴缁勪欢缁х画鐩存帴缁存姢杩欎簺娴佺▼鍒ゆ柇銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLifecycle.ts` 涓?`adminWorkspaceLifecycle.test.ts`锛屾敹鍙?`buildAdminWorkspaceMountPlan(...)`銆乣buildAdminWorkspacePopstatePlan(...)`銆乣buildAdminWorkspaceViewSwitchPlan(...)`銆乣buildAdminWorkspaceSessionClearedPlan(...)` 涓?`buildAdminWorkspaceLogoutPlan(...)` 浜斾釜鍑哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃鎸傝浇鑷妇銆乣popstate`銆佸鑸垏鎹€佷細璇濆け鏁堝洖閫€鍜岄€€鍑鸿矾寰勯兘鏀逛负娑堣垂鍏变韩 lifecycle helper锛岃€屼笉鏄户缁湪宸ヤ綔鍙伴噷鎵嬪啓 reset/sync/load 鍒嗘敮銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙宸ヤ綔鍙扮敓鍛藉懆鏈熻鍒掍篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLifecycle.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜伐浣滃彴璺敱瀹氫綅鎺ㄨ繘鍒板叡浜敓鍛藉懆鏈熻鍒掞紝鎸傝浇鑷妇銆佸鑸垏鎹㈠拰浼氳瘽鍥為€€寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙敓鍛藉懆鏈?helper锛涙洿杩涗竴姝ョ殑 bootstrap/load 璇锋眰缂栨帓浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 21:52:30 +08:00 | v1.1.0-alpha.219 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴璺敱瀹氫綅 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼笌鍚庡彴 URL 瑙ｆ瀽銆佽矾寰勫綊涓€鍖栧拰瀵艰埅鍒囨崲鍘嗗彶鍚屾鐩稿叧鐨勯€昏緫銆?- 鐩爣鏄ˉ涓€涓叡浜矾鐢卞畾浣?helper锛屽苟璁╁伐浣滃彴鐨勫垵濮嬪寲瑙嗗浘銆侀潪娉曡矾寰勪慨姝ｃ€佸鑸垏鎹㈠拰浼氳瘽澶辨晥鍥為€€閮藉鐢ㄧ粺涓€鍑哄彛锛屽噺灏戦〉闈㈠眰缁х画鍐呰仈杩欎簺 URL 鍒嗘敮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLocation.ts` 涓?`adminWorkspaceLocation.test.ts`锛屾敹鍙?`resolveAdminWorkspaceLocationView(...)`銆乣normalizeAdminWorkspaceLocation(...)` 涓?`syncAdminWorkspaceLocation(...)` 涓変釜鍑哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `activeView` 鍒濆鍖栥€乣popstate` 鍥為€€銆佹寕杞芥椂 URL 褰掍竴鍖栥€乣switchView(...)` 瀵艰埅鍒囨崲锛屼互鍙?session 澶辨晥/閫€鍑烘椂鐨?`replace` 鍥為€€閮芥敼涓烘秷璐瑰叡浜?`adminWorkspaceLocation` helper銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙宸ヤ綔鍙?URL/瑙嗗浘鍚屾涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLocation.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜淳鐢熸暟鎹€昏緫鎺ㄨ繘鍒板叡浜伐浣滃彴璺敱瀹氫綅锛屽垵濮嬪寲瑙嗗浘銆侀潪娉曡矾寰勪慨姝ｅ拰瀵艰埅鍘嗗彶鍚屾寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚矾鐢卞畾浣?helper锛涙洿杩涗竴姝ョ殑 session/bootstrap 鍗忚皟涓庢暟鎹姞杞界紪鎺掍粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 21:11:40 +08:00 | v1.1.0-alpha.218 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴娲剧敓鏁版嵁 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽鏍稿垪琛ㄤ笌娌荤悊鍒楄〃鍒嗘暎缁存姢鐨勬淳鐢熸暟鎹€昏緫銆?- 鐩爣鏄ˉ涓€涓叡浜淳鐢熸暟鎹?helper锛屽苟璁╁笘瀛?璧勬枡鎷嗗垎銆佹湰鍦扮瓫閫変笌鐘舵€侀€夐」鐢熸垚閮藉鐢ㄧ粺涓€鍑哄彛锛屽噺灏戝伐浣滃彴灞傜户缁唴鑱旇繖浜?`computed` 鍒嗘敮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceDerivedData.ts` 涓?`adminWorkspaceDerivedData.test.ts`锛屾敹鍙?`splitModerationItems(...)`銆乣filterModerationItems(...)`銆乣buildModerationStatusOptions(...)`銆乣filterGovernanceRows(...)` 涓?`buildGovernanceStatusOptions(...)` 浜斾釜鍑哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `pendingPosts`銆乣pendingMaterials`銆乣visibleModerationItems`銆乣moderationStatusOptions`銆乣visibleGovernanceRows` 涓?`governanceStatusOptions` 鍏ㄩ儴鏀逛负娑堣垂鍏变韩 `adminWorkspaceDerivedData` helper锛岃€屼笉鏄户缁湪宸ヤ綔鍙伴噷鍐呰仈绛涢€夊拰鐘舵€侀€夐」鍒嗘敮銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙宸ヤ綔鍙版淳鐢熸暟鎹篃宸茶繘鍏ュ叡浜?helper 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceDerivedData.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜伐浣滃彴鎻愮ず璇箟鎺ㄨ繘鍒板叡浜淳鐢熸暟鎹€昏緫锛屽鏍稿垪琛ㄤ笌娌荤悊鍒楄〃寮€濮嬪鐢ㄧ粺涓€鐨勬媶鍒嗐€佺瓫閫夊拰鐘舵€侀€夐」鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗘淳鐢熸暟鎹?helper锛涙洿杩涗竴姝ョ殑宸ヤ綔鍙扮骇瑙嗗浘鍒囨崲銆乁RL 鍚屾涓庤姹傚崗璋冮€昏緫浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 07:49:16 +08:00 | v1.1.0-alpha.197 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?FilterBar 绛涢€夋潯楠ㄦ灦鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊瀹℃牳妯″潡涓庢不鐞嗘ā鍧楅噷閲嶅鍑虹幇鐨勨€滄悳绱㈡爮 + 绛涢€変笅鎷?+ 璁℃暟鈥濈瓫閫夋潯楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminFilterBar` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳妯″潡涓庢不鐞嗘ā鍧楅噷閲嶅鐨勬悳绱㈢瓫閫夋潯鍒囧埌缁熶竴鍑哄彛锛岃鍚庡彴楂橀鍒楄〃鐨勭瓫閫夊叆鍙ｄ笉鍐嶅悇鑷淮鎶ょ浉鍚岄鏋舵ā鏉裤€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminFilterBar.vue` 涓?`AdminFilterBar.test.ts`锛屾敹鍙ｅ悗鍙扮瓫閫夋潯鐨勫叡浜鏋讹紝骞剁粺涓€鎵挎帴鎼滅储杈撳叆銆佺姸鎬佺瓫閫夊拰璁℃暟灞曠ず銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸瀹℃牳/娌荤悊妯″潡閲岀殑鍐呰仈绛涢€夋潯缁撴瀯鏇挎崲涓哄叡浜?`AdminFilterBar`锛屽悓鏃朵繚鐣欏悇鑷凡鏈夌殑鏌ヨ銆佺瓫閫夊瓧娈靛拰娴嬭瘯閽╁瓙銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岃ˉ涓婁袱鏉＄湡瀹炴ā鍧楄矾寰勫凡缁忛€氳繃鍏变韩绛涢€夋潯楠ㄦ灦娓叉煋鎼滅储鍜岀瓫閫夊叆鍙ｇ殑鏂█銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminFilterBar.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙伴珮棰戠瓫閫夐鏋跺悜涓婃敹鍙ｏ紝瀹℃牳妯″潡涓庢不鐞嗘ā鍧楀紑濮嬪叡浜粺涓€鐨勬悳绱㈢瓫閫夋潯鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙瓫閫夋潯楠ㄦ灦锛涙洿杩涗竴姝ョ殑澶氭潯浠剁瓫閫夋ā鍨嬨€佺瓫閫夋潯浠跺垎缁勮涔夊拰鏇村畬鏁寸殑 filter bar 濂戠害杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 07:44:48 +08:00 | v1.1.0-alpha.196 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?FilterSelect 绛涢€変笅鎷夋帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊瀹℃牳妯″潡涓庢不鐞嗘ā鍧楅噷閲嶅鍑虹幇鐨勭姸鎬佺瓫閫変笅鎷夌粨鏋勩€?- 鐩爣鏄ˉ涓€涓?`AdminFilterSelect` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳妯″潡涓庢不鐞嗘ā鍧楅噷閲嶅鐨?`AdminSelect + option 鍒楄〃 + 鐘舵€佺瓫閫夐挬瀛恅 缁撴瀯鍒囧埌缁熶竴绛涢€変笅鎷夊嚭鍙ｏ紝璁╁悗鍙伴珮棰戠瓫閫夊叆鍙ｄ笉鍐嶅悇鑷淮鎶ょ浉鍚屾ā鏉裤€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminFilterSelect.vue` 涓?`AdminFilterSelect.test.ts`锛屾敹鍙ｅ悗鍙扮瓫閫変笅鎷夌殑鍏变韩楠ㄦ灦銆侀€夐」娓叉煋涓庡€煎彉鏇翠簨浠躲€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸瀹℃牳/娌荤悊妯″潡閲岀殑鍐呰仈鐘舵€佺瓫閫変笅鎷夋浛鎹负鍏变韩 `AdminFilterSelect`锛屽悓鏃朵繚鐣欏悇鑷凡鏈夌殑绛涢€夊瓧娈靛拰娴嬭瘯閽╁瓙銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岃ˉ涓婁袱鏉＄湡瀹炴ā鍧楄矾寰勫凡缁忛€氳繃鍏变韩绛涢€変笅鎷夋覆鏌撶姸鎬佺瓫閫夊叆鍙ｇ殑鏂█銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminFilterSelect.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙伴珮棰戠瓫閫夐鏋跺悜涓婃敹鍙ｏ紝瀹℃牳妯″潡涓庢不鐞嗘ā鍧楀紑濮嬪叡浜粺涓€鐨勭姸鎬佺瓫閫変笅鎷夊嚭鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙瓫閫変笅鎷夋湰韬紱鏇磋繘涓€姝ョ殑绛涢€夋潯妯″瀷銆佹潯浠跺垎缁勮涔夊拰澶氭潯浠?filter bar 濂戠害杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 07:40:27 +08:00 | v1.1.0-alpha.195 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?MetricGrid 鎸囨爣缃戞牸鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊 dashboard 涓庢不鐞嗘憳瑕佸尯閲岄噸澶嶅嚭鐜扮殑鎸囨爣鍗＄墖缃戞牸缁撴瀯銆?- 鐩爣鏄ˉ涓€涓?`AdminMetricGrid` Vue 閫傞厤灞傦紝骞舵妸 dashboard 姒傝鍖轰笌娌荤悊鎽樿鍖洪噷閲嶅鐨?`admin-metric-grid + AdminMetricCard` 缁撴瀯鍒囧埌缁熶竴缃戞牸鍑哄彛锛岃鍚庡彴楂橀姒傝鍗＄墖涓嶅啀鍚勮嚜缁存姢鐩稿悓鐨勬寚鏍囩綉鏍兼ā鏉裤€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminMetricGrid.vue` 涓?`AdminMetricGrid.test.ts`锛屾敹鍙ｅ悗鍙版寚鏍囧崱鐗囩綉鏍肩殑鍏变韩楠ㄦ灦锛屽苟缁熶竴鎵挎帴 `AdminMetricCard` 鍒楄〃娓叉煋銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸 dashboard 姒傝鍖哄拰娌荤悊鎽樿鍖洪噷鐨勫唴鑱旀寚鏍囩綉鏍兼浛鎹负鍏变韩 `AdminMetricGrid`锛屽悓鏃朵繚鐣欏悇鑷凡鏈夌殑鎸囨爣鍐呭涓庡竷灞€銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岃ˉ涓婁袱鏉＄湡瀹炴ā鍧楄矾寰勫凡缁忛€氳繃鍏变韩鎸囨爣缃戞牸娓叉煋姒傝鍗＄墖鐨勬柇瑷€銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminMetricGrid.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙版瑙堥鏋跺悜涓婃敹鍙ｏ紝dashboard 涓庢不鐞嗘憳瑕佸尯寮€濮嬪叡浜粺涓€鐨勬寚鏍囩綉鏍煎嚭鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙綉鏍奸鏋讹紱鏇磋繘涓€姝ョ殑鎸囨爣鏁版嵁妯″瀷銆佸崱鐗囧垎缁勮涔夊拰鏇村鍚庡彴鎽樿鍖哄绾﹁繕娌℃湁缁熶竴锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 07:35:28 +08:00 | v1.1.0-alpha.194 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?DataTable 琛ㄦ牸澹冲眰鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊瀹℃牳涓庢不鐞嗘ā鍧楅噷閲嶅鍑虹幇鐨勮〃鏍煎崱鐗囬鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminDataTable` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳妯″潡涓庢不鐞嗘ā鍧楅噷閲嶅鐨?`DataCardHeader + DataState + admin-table` 缁撴瀯鍒囧埌缁熶竴琛ㄦ牸澹冲眰鍑哄彛锛岃鍚庡彴楂橀鍒楄〃涓嶅啀鍚勮嚜缁存姢鐩稿悓鐨勫崱鐗?鐘舵€?琛ㄦ牸瀹瑰櫒妯℃澘銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminDataTable.vue` 涓?`AdminDataTable.test.ts`锛屾敹鍙ｅ悗鍙拌〃鏍煎崱鐗囨爣棰樺尯銆佺姸鎬佸尯鍜岃〃鏍煎鍣ㄧ殑鍏变韩楠ㄦ灦锛屽苟閫氳繃鎻掓Ы鎵挎帴琛ㄥご鍜岃鍐呭銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸瀹℃牳/娌荤悊妯″潡閲岀殑鍐呰仈琛ㄦ牸鍗＄墖缁撴瀯鏇挎崲涓哄叡浜?`AdminDataTable`锛屽悓鏃朵繚鐣欏悇鑷凡鏈夌殑绛涢€夋潯銆佽〃澶淬€佽缁勪欢鍜岃鎯呭尯銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岃ˉ涓婁袱鏉＄湡瀹炴ā鍧楄矾寰勫凡缁忛€氳繃鍏变韩琛ㄦ牸澹冲眰娓叉煋鍒楄〃楠ㄦ灦鐨勬柇瑷€銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataTable.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙伴珮棰戝垪琛ㄩ鏋跺悜涓婃敹鍙ｏ紝瀹℃牳鍜屾不鐞嗘ā鍧楅櫎浜嗚〃澶翠笌琛岀粍浠朵箣澶栵紝涔熷紑濮嬪叡浜粺涓€鐨勮〃鏍煎崱鐗囧３灞傘€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚〃鏍奸鏋讹紱鏇磋繘涓€姝ョ殑鍒楀畾涔夋ā鍨嬨€佺┖鐘舵€佹枃妗堣鑼冨拰鏇撮€氱敤鐨勬暟鎹〃濂戠害杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 07:27:20 +08:00 | v1.1.0-alpha.193 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?TableHead 琛ㄥご鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊瀹℃牳涓庢不鐞嗗垪琛ㄩ噷閲嶅鍑虹幇鐨勮〃澶撮鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminTableHead` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳妯″潡涓庢不鐞嗘ā鍧楃殑 `admin-table__head` 閮藉垏鍒扮粺涓€琛ㄥご鍑哄彛锛岃鍒楄〃鍒楀悕楠ㄦ灦涓嶅啀鍒嗘暎鍦ㄥ涓ā鍧楁ā鏉块噷缁存姢銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminTableHead.vue` 涓?`AdminTableHead.test.ts`锛屾敹鍙ｅ悗鍙拌〃鏍艰〃澶寸殑鍒楀悕娓叉煋椤哄簭涓庡叡浜爣璁般€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸瀹℃牳/娌荤悊妯″潡閲岀殑鍐呰仈琛ㄥご缁撴瀯鏇挎崲涓哄叡浜?`AdminTableHead`锛屽悓鏃朵繚鐣欏悇鑷凡鏈夌殑鍒楀畾涔変笌鍒楄〃甯冨眬銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岃ˉ涓婁袱鏉＄湡瀹炴ā鍧楄矾寰勫凡缁忛€氳繃鍏变韩琛ㄥご閫傞厤灞傛覆鏌撳垪鍚嶇殑鏂█銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminTableHead.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙伴珮棰戣〃鏍奸鏋跺悜涓婃彁浜嗕竴灞傦紝瀹℃牳鍒楄〃鍜屾不鐞嗗垪琛ㄩ櫎浜嗚缁勪欢涔嬪锛屼篃寮€濮嬪叡浜粺涓€琛ㄥご鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚〃澶达紱鏇村畬鏁寸殑鍒楄〃鍒楀畾涔夈€佽〃浣撳３灞傚拰鍙鐢ㄦ暟鎹〃濂戠害杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 07:23:02 +08:00 | v1.1.0-alpha.192 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?ModerationRow 瀹℃牳琛屾帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑娌荤悊鑳藉姏锛岃€屾槸缁х画娓呯悊瀹℃牳涓昏矾寰勯噷浠嶇劧淇濈暀鐨勫唴鑱斿垪琛ㄨ缁撴瀯銆?- 鐩爣鏄ˉ涓€涓?`AdminModerationRow` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳妯″潡鐨勫唴瀹硅鍒囧埌缁熶竴琛屽嚭鍙ｏ紝璁╁唴瀹规憳瑕併€佺被鍨?鐘舵€佹爣绛俱€佸姩浣滃尯鍜岃绾ф爣璁板绾︿笉鍐嶆暎钀藉湪椤甸潰妯℃澘閲屻€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminModerationRow.vue` 涓?`AdminModerationRow.test.ts`锛屾敹鍙ｅ鏍稿垪琛ㄨ鐨勫唴瀹规憳瑕併€佺被鍨嬫爣绛俱€佺姸鎬佹爣绛俱€佸姩浣滃尯涓?`press` 浜嬩欢銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue`锛屾妸瀹℃牳妯″潡閲岀殑鍐呰仈 `<article>` 琛岀粨鏋勬浛鎹负鍏变韩 `AdminModerationRow`锛屼繚鐣欐棦鏈夋悳绱€佺姸鎬佺瓫閫夊拰鍔ㄤ綔瑙﹀彂濂戠害銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃ˉ涓婂鏍告ā鍧楀拰宸ヤ綔鍙板凡缁忚蛋鍏变韩瀹℃牳琛岄€傞厤灞傜殑鏂█锛屽苟璁╂湰鍦扮瓫閫夊洖褰掑垏鍒版柊鐨勮绾ф爣璁般€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminModerationRow.test.ts src/views/modules/AdminModerationModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庢不鐞嗚鎯呭垪琛ㄥ悜瀹℃牳涓昏矾寰勫唴閮ㄦ帹杩涳紝鍏变韩鍚庡彴楠ㄦ灦宸插悓鏃惰鐩栨不鐞嗚褰曡涓庡鏍稿唴瀹硅杩欎袱绫婚珮棰戝垪琛ㄥ叆鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗗鏍歌鏈韩锛涘垪琛ㄨ〃澶淬€佸垪瀹氫箟鍜屾洿閫氱敤鐨勬暟鎹〃楠ㄦ灦杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖浜涢珮棰戠粨鏋勬帹杩涳紝鑰屼笉鏄烦鍘绘柊鐨勫煙鍔熻兘銆?
## 2026-07-13 07:17:00 +08:00 | v1.1.0-alpha.191 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?RecordRow 璁板綍琛屾帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊绠＄悊绔湡瀹炰富璺緞閲岄噸澶嶅嚭鐜扮殑璁板綍琛岄鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminRecordRow` Vue 閫傞厤灞傦紝骞舵妸娌荤悊妯″潡鐨勮褰曞垪琛ㄥ垏鍒扮粺涓€璁板綍琛屽嚭鍙ｏ紝璁╃姸鎬佹爣绛俱€侀€変腑鎬佸拰鐐瑰嚮閫夋嫨濂戠害涓嶅啀鏁ｈ惤鍦ㄩ〉闈㈠唴鑱旀ā鏉块噷銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminRecordRow.vue` 涓?`AdminRecordRow.test.ts`锛屾敹鍙ｆ不鐞嗚褰曡鐨勬寜閽鏋躲€佺姸鎬佹爣绛炬覆鏌撱€佺┖鍊兼牸寮忓寲鍜?`press` 浜嬩欢銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛屾妸娌荤悊璁板綍鍒楄〃浠庡唴鑱?`<button>` / `<span>` 缁撴瀯鏇挎崲涓哄叡浜?`AdminRecordRow`锛屼繚鐣欐棦鏈?`data-record-row`銆侀€変腑鎬佸拰璁板綍閫夋嫨浜嬩欢銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.test.ts`锛岃ˉ涓婃不鐞嗘ā鍧楀凡缁忚蛋鍏变韩 `AdminRecordRow` 閫傞厤灞傜殑鏂█锛屽悓鏃朵繚鎸佹棦鏈夎褰曢€夋嫨銆佺姸鎬佹爣绛惧拰绛涢€夎涓哄洖褰掋€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminRecordRow.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画鍚戠鐞嗙鐪熷疄璁板綍鍒楄〃鍐呴儴鎺ㄨ繘浜嗕竴灞傦紝鍏变韩娌荤悊楠ㄦ灦涓嶅啀鍙鐩栧鑸€佹搷浣滄爮銆佹爣绛惧拰鍐呭鎽樿鍗曞厓锛屼篃寮€濮嬭鐩栭珮棰戠殑璁板綍琛屽叆鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗘不鐞嗚褰曞垪琛紱瀹℃牳鍒楄〃銆佹洿澶氬悗鍙拌〃鏍艰鍥句互鍙婃洿缁熶竴鐨勮〃澶?鍒楀畾涔夊绾﹁繕娌℃湁杩涘叆鍏变韩鎶借薄锛屽悗缁€傚悎缁х画娌胯繖浜涢珮棰戝垪琛ㄩ鏋舵帹杩涖€?
## 2026-07-13 05:56:43 +08:00 | v1.1.0-alpha.179 | 鎺ㄨ繘 FE-041 绠＄悊绔鏍告不鐞嗗叡浜悳绱㈠伐鍏锋爮鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊绠＄悊绔湡瀹炰富璺緞閲岄噸澶嶅嚭鐜扮殑鎼滅储宸ュ叿鏍忛鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminSearchToolbar` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳闃熷垪涓庢不鐞嗚褰曡繖涓ゆ潯鍚庡彴楂橀鍏ュ彛鍒囧埌缁熶竴鎼滅储鏉″嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminSearchToolbar.vue` 涓?`AdminSearchToolbar.test.ts`锛屾敹鍙ｅ悗鍙版悳绱㈣緭鍏ユ鍜岀粨鏋滆鏁板尯杩欑粍宸ュ叿鏍忚涔夈€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛岃瀹℃牳鍜屾不鐞嗘ā鍧楃粺涓€閫氳繃 `AdminSearchToolbar` 娓叉煋鎼滅储杈撳叆涓庤鏁板厓淇℃伅銆?- 閲嶅啓 `frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`AdminGovernanceModule.test.ts`锛岄攣瀹氳繖涓ゆ潯鐪熷疄娌荤悊璺緞宸茬粡閫氳繃鍏变韩鎼滅储宸ュ叿鏍忔毚闇?`ds-input`銆佽鏁板尯鍜屾煡璇簨浠讹紝鑰屼笉鏄户缁洿鎺ヤ緷璧栧眬閮?DOM 鎷艰銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙涔熷凡鍏峰鍏变韩 `AdminSearchToolbar` 閫傞厤灞傚苟鎺ュ叆瀹℃牳/娌荤悊妯″潡鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminSearchToolbar.test.ts src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙敹鍙ｅ悗鍙伴〉澶撮鏋讹紝瀹℃牳鍜屾不鐞嗘ā鍧椾篃寮€濮嬭蛋缁熶竴鎼滅储宸ュ叿鏍忛€傞厤灞傦紝鍚庣画缁х画鎺ㄨ繘鍚庡彴绛涢€夋潯鍜岃〃鏍煎伐鍏锋爮鏃跺彲浠ュ鐢ㄥ悓涓€鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堣鐩栦簡鎼滅储杈撳叆鍜岃鏁板尯锛涚瓫閫変笅鎷夈€佹壒閲忓姩浣滃拰鏇村鏉傜殑 filter bar 缁勫悎杩樻病鏈夎繘鍏ョ粺涓€濂戠害锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢珮棰戞不鐞嗛鏋舵帹杩涖€?
## 2026-07-13 05:49:05 +08:00 | v1.1.0-alpha.178 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞傚叡浜?PageHeader 閫傞厤灞傛帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧埌鏂扮殑娌荤悊鑳藉姏锛岃€屾槸缁х画娓呯悊绠＄悊绔湡瀹炰富璺緞閲岄噸澶嶅嚭鐜扮殑椤靛ご楠ㄦ灦銆?- 鐩爣鏄负鍚庡彴澹冲眰琛ヤ竴涓?`AdminPageHeader` Vue 閫傞厤灞傦紝骞舵妸 `AdminShellFrame` 鍒囧埌缁熶竴椤靛ご鍑哄彛锛岃 dashboard銆佸鏍稿拰娌荤悊瑙嗗浘鍏堝叡浜悓涓€濂楀ご閮ㄥ绾︺€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminPageHeader.vue` 涓?`AdminPageHeader.test.ts`锛屾敹鍙ｇ鐞嗙 `eyebrow / title / description / actions` 椤靛ご楠ㄦ灦璇箟锛屽苟琛?actions 鎻掓Ы鏈夋棤涓ょ鍥炲綊銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.vue`锛屾妸鍚庡彴涓诲伐浣滃尯鐨勬湰鍦伴〉澶寸粨鏋勬浛鎹负 `AdminPageHeader`锛屽悓鏃朵繚鐣欒鏁?chip 浣滀负 actions 鎻掓Ы杈撳嚭銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.test.ts`锛岄攣瀹氬悗鍙板３灞傚凡缁忛€氳繃缁熶竴椤靛ご閫傞厤灞傛覆鏌撲富鏍囬鍜岃鏁板尯锛岃€屼笉鏄彧鏂板浜嗕竴涓湭鎺ョ嚎缁勪欢銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙涔熷凡鍏峰鍏变韩 `AdminPageHeader` 閫傞厤灞傚苟鎺ュ埌澹冲眰鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/modules/AdminModerationModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙湪鐢ㄦ埛绔敹鍙ｉ〉澶撮鏋讹紝绠＄悊绔３灞備篃寮€濮嬭蛋缁熶竴椤靛ご閫傞厤灞傦紝鍚庣画缁х画鏀跺彛鍚庡彴绛涢€夋潯鍜屾ā鍧楀伐鍏锋爮鐨勬垚鏈細鏇翠綆銆?- 杩欎竴杞粛鐒跺彧鍏堣鐩栦簡鍚庡彴涓婚〉澶达紱dashboard 鍗＄墖澶撮儴銆佹不鐞嗙瓫閫夋潯鍜屾洿澶氳〃鏍煎伐鍏锋爮杩樻病鏈夎繘鍏ョ粺涓€濂戠害锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢珮棰戦鏋舵帹杩涳紝鑰屼笉鏄垏鍘绘柊鍩熷姛鑳姐€?
## 2026-07-13 05:42:49 +08:00 | v1.1.0-alpha.177 | 鎺ㄨ繘 FE-041 鍥捐氨宸ヤ綔鍖哄叡浜?PageHeader 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍥炲埌鍥捐氨鎺у埗鍣ㄦ繁灞傞噸鏋勶紝鑰屾槸缁х画娓呯悊鐪熷疄涓昏矾寰勯噷浠嶇劧鏁ｈ惤鐨勬湰鍦伴〉澶撮鏋跺垎鍙夈€?- 鐩爣鏄妸 `GraphWorkspaceHeader` 鍒囧埌鍏变韩 `PageHeader` 鍑哄彛锛屽悓鏃朵繚鐣欏浘璋卞伐浣滃尯宸叉湁鐨勨€滄柊寤哄浘璋?/ 淇濆瓨 / 淇濆瓨鐘舵€佲€濊繖涓€缁勫姩浣滆涔夈€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.tsx`锛屾妸鍥捐氨宸ヤ綔鍖哄ご閮ㄤ粠鏈湴 `workspace-header` 缁撴瀯鏇挎崲涓哄叡浜?`PageHeader`锛屼繚鐣欐棦鏈夋寜閽€佺鐢ㄦ€佸拰淇濆瓨鐘舵€佹彁绀恒€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.test.tsx`锛屾敼涓虹洿鎺?mock 鍏变韩 `PageHeader` 骞惰ˉ鍏变韩濂戠害鏂█锛岄攣瀹氬浘璋卞伐浣滃尯澶撮儴宸茬粡閫氳繃缁熶竴椤靛ご鍑哄彛鏆撮湶 `eyebrow / title / description / actions`銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?PageHeader 宸茶鐩栦富宸ヤ綔鍖洪〉闈€佹悳绱㈠伐浣滃尯涓庡浘璋卞伐浣滃尯鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪鍙堣ˉ涓婁簡鍥捐氨宸ヤ綔鍖鸿繖鏉￠珮棰戜富璺緞閲岀殑鍏变韩椤靛ご楠ㄦ灦锛岀敤鎴风鍓╀綑鐩存帴鎵嬪啓 `workspace-header` 鐨勫垎鏀繘涓€姝ュ噺灏戙€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｄ簡鍥捐氨宸ヤ綔鍖哄ご閮紱绠＄悊绔〉澶淬€佺瓫閫夋潯浠ュ強鍥捐氨澶撮儴閲屾洿楂樺眰鐨勭姸鎬佸窘鏍囩粍鍚堜粛鏈粺涓€锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢噸澶嶉鏋舵帹杩涳紝鑰屼笉鏄洖鍒板崟涓€娣卞眰閫昏緫閲嶆瀯銆?
## 2026-07-13 05:30:41 +08:00 | v1.1.0-alpha.176 | 鎺ㄨ繘 FE-041 鎼滅储宸ヤ綔鍖哄叡浜?PageHeader 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍘诲仛鏂扮殑涓氬姟鑳藉姏锛岃€屾槸琛ユ悳绱㈠伐浣滃尯杩樺仠鐣欏湪鏈湴 `workspace-header` 缁撴瀯涓婄殑椤靛ご楠ㄦ灦鍒嗗弶銆?- 鐩爣鏄妸 `SearchWorkspacePage` 鍒囧埌鍏变韩 `WorkspaceHeader` / `PageHeader` 鍑哄彛锛岃鍏变韩椤靛ご涓嶅啀鍙鐩栦富宸ヤ綔鍖洪〉闈€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`锛屾妸鑷啓 `workspace-header` 缁撴瀯鏇挎崲鎴愬叡浜?`WorkspaceHeader`锛屼繚鐣欏師鏈夋爣棰樸€乪yebrow 鍜岃鏄庢枃妗堛€?- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`锛屽湪淇濈暀鎼滅储绌烘€併€佸姞杞芥€併€侀敊璇€併€佺瓫閫変笌鍒嗛〉鍥炲綊鐨勫悓鏃讹紝鏂板 `workspace-header` 楠ㄦ灦鏂█锛岄攣瀹氭悳绱㈠伐浣滃尯纭疄璧颁簡鍏变韩椤靛ご鍑哄彛銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?PageHeader 宸茶鐩栦富宸ヤ綔鍖洪〉闈笌鎼滅储宸ヤ綔鍖衡€濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪鍙堣ˉ涓婁簡鎼滅储宸ヤ綔鍖鸿繖鏉＄湡瀹炲叆鍙ｇ殑鍏变韩椤靛ご楠ㄦ灦锛岀敤鎴风鍓╀綑鐩存帴鎵嬪啓 `workspace-header` 鐨勫垎鏀繘涓€姝ュ噺灏戙€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｄ簡鎼滅储宸ヤ綔鍖哄ご閮紱鍥捐氨宸ヤ綔鍖哄ご閮ㄤ粛鏈夋洿澶嶆潅鐨勪繚瀛樼姸鎬佸拰鍔ㄤ綔鍖猴紝鍚庣画鏇撮€傚悎缁х画娌块偅鏉″垎鏀敹鍥炲叡浜〉澶村嚭鍙ｃ€?
## 2026-07-13 05:27:24 +08:00 | v1.1.0-alpha.175 | 鎺ㄨ繘 FE-041 澶嶄範宸ヤ綔鍖哄叡浜?Select 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆＄户缁竻鐞嗙敤鎴风杩樼暀鍦ㄧ湡瀹炰富璺緞涓婄殑瑁镐笅鎷夛紝鑰屼笉鏄洖澶村仛鏇存繁鐨勪笟鍔￠€昏緫閲嶆瀯銆?- 鐩爣鏄妸澶嶄範宸ヤ綔鍖烘柊寤哄崱缁勮〃鍗曢噷鐨勨€滃崱缁勫彲瑙佹€р€濆垏鍒板叡浜?`Select`锛岃ˉ涓婂叡浜笅鎷夊湪瀛︿範闂幆鏈€鍚庝竴娈电鐞嗗叆鍙ｉ噷鐨勮鐩栥€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屾妸鏂板缓鍗＄粍琛ㄥ崟閲岀殑鈥滃崱缁勫彲瑙佹€р€濆師鐢熶笅鎷夋浛鎹㈡垚鍏变韩 `Select`锛屼繚鐣欐棦鏈夎〃鍗曠姸鎬佷笌 `createDeck(...)` 鎻愪氦閫昏緫銆?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛屾柊澧炩€滄墦寮€绠＄悊闈㈡澘 -> 鏂板缓鍗＄粍 -> 鍒囨崲鍏紑鍙 -> 鎻愪氦鈥濈殑椤甸潰鍥炲綊锛屽苟鏂█璇?`combobox` 宸叉毚闇?`ds-select` 濂戠害銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Select 宸茶鐩栫瑪璁般€侀槄璇汇€佸涔犲伐浣滃尯銆佸浘璋卞伐浣滃尯涓?AI 鑽夌涓績鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪鍙堣ˉ涓婁簡澶嶄範宸ヤ綔鍖鸿繖鏉＄湡瀹炲涔犱富璺緞閲岀殑鍏变韩涓嬫媺锛岀敤鎴风鍓╀綑瑁?`select` 杩涗竴姝ュ噺灏戯紝鍚庣画缁熶竴琛ㄥ崟璇箟浼氭洿椤恒€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｄ簡澶嶄範宸ヤ綔鍖虹殑鍙鎬т笅鎷夛紱绠＄悊绔瓫閫夊櫒銆佹悳绱㈤〉/鍥捐氨椤靛ご楠ㄦ灦浠ュ強鏇村鍏变韩琛ㄥ崟 primitive 杩樻病缁熶竴锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢噸澶嶆ā寮忔帹杩涖€?
## 2026-07-13 05:22:29 +08:00 | v1.1.0-alpha.174 | 鎺ㄨ繘 FE-041 AI 鑽夌涓績鍏变韩 Select 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍥炲埌鍥捐氨鎺у埗鍣ㄦ垨鍚庡彴娌荤悊娣卞眰閫昏緫锛岃€屾槸缁х画琛ヤ竴鍧楄鐩栭潰骞裤€佽兘鎻愬崌鍏ㄥ眬涓€鑷存€х殑鍏变韩琛ㄥ崟 primitive 缂哄彛銆?- 鐩爣鏄妸 `AiPage` 閲屾潵婧愮瓫閫夈€佺姸鎬佺瓫閫夈€佸啓鍏ョ洰鏍?deck 鍜屽啓鍏ョ洰鏍囧浘璋辫繖鍥涗釜楂橀涓嬫媺鎺ュ埌鍏变韩 `Select`锛岃鍏变韩 UI 濂戠害浠庨槄璇?绗旇/鍥捐氨缁х画鎵╁埌 AI 鑽夌涓诲伐浣滃彴銆?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/pages/AiPage.tsx`锛屾妸鏉ユ簮绛涢€夈€佺姸鎬佺瓫閫夈€佸啓鍏ョ洰鏍?deck 涓庡啓鍏ョ洰鏍囧浘璋卞洓涓師鐢熶笅鎷夋浛鎹㈡垚鍏变韩 `Select`锛屽悓鏃朵繚鐣欐棦鏈?`select-field` class銆佺瓫閫夌姸鎬佸拰鎻愪氦鍥炶皟銆?- 閲嶅啓 `frontend-user/src/pages/AiPage.test.tsx`锛屾妸鍗＄墖鑽夌纭銆佸浘璋卞彉鏇寸‘璁ゃ€侀灞?error 鍜屽埛鏂?stale 鐨勯〉闈㈠洖褰掔粺涓€鍒扮ǔ瀹氭祴璇曞熀绾夸笂銆?- 鏂板 AI 椤甸潰鍏变韩涓嬫媺鏂█锛岄攣瀹氬洓涓?`combobox` 閮藉悓鏃舵毚闇?`ds-select` 涓庢棦鏈?`select-field` 濂戠害锛岃€屼笉鏄彧鍋滅暀鍦ㄢ€滆涓鸿繕鑳介€変腑鈥濄€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Select 宸茶鐩栫瑪璁般€侀槄璇汇€佸浘璋卞伐浣滃尯涓?AI 鑽夌涓績鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栭槄璇汇€佺瑪璁板拰鍥捐氨琛ㄥ崟锛孉I 鑽夌涓績閲岀殑楂橀绛涢€変笌鐩爣閫夋嫨鍣ㄤ篃寮€濮嬫秷璐瑰叡浜?`Select`锛屽悗缁户缁敹鍙ｆ洿澶氳法椤甸潰琛ㄥ崟璇箟浼氭洿椤恒€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｄ簡 AI 椤电殑涓嬫媺锛涚鐞嗙绛涢€夊櫒銆佹洿澶氬浘璋遍〉澶?琛ㄥ崟 primitive 浠ュ強鏇撮珮灞?helper 鏂囨杩樻病鏈夌粺涓€锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢噸澶嶇偣鎺ㄨ繘銆?
## 2026-07-13 05:14:39 +08:00 | v1.1.0-alpha.173 | 鎺ㄨ繘 FE-041 鍥捐氨宸ヤ綔鍖哄叡浜?Select 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍥炲埌鍥捐氨鎺у埗鍣ㄦ繁灞傞噸鏋勶紝鑰屾槸鎸戜竴涓鐩栭潰骞裤€侀闄╀綆鐨勫叡浜?primitive 缂哄彛缁х画鏀跺彛銆?- 鐩爣鏄妸鍥捐氨宸ヤ綔鍖洪噷鏈€甯哥敤鐨勮妭鐐圭被鍨嬨€佺粨鏋勫寲 metadata銆佽竟褰㈡€佸拰鍐欏叆 deck 閫夋嫨鍣ㄦ帴鍒板叡浜?`Select`锛岃鍏变韩 UI 濂戠害缁х画浠庣瑪璁?闃呰琛ㄥ崟鎵╁睍鍒板浘璋变富宸ヤ綔鍙般€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.tsx`锛屾妸宸ュ叿鏍忊€滄柊寤鸿妭鐐圭被鍨嬧€濅笅鎷夊垏鍒板叡浜?`Select`锛屼繚鐣欑幇鏈?`graph-node-type-select` class銆佺鐢ㄦ€佸拰 `onQuickNodeTypeChange(...)` 鍥炶皟銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceSelectionPanel.tsx`锛屾妸鍗曡妭鐐?metadata 閫夐」瀛楁鍜岃竟褰㈡€侀€夋嫨鍣ㄥ垏鍒板叡浜?`Select`锛岃宸ョ▼鍥剧被鍨嬩笌杈瑰叧绯荤紪杈戜笉鍐嶅仠鐣欏湪灞€閮ㄨ８ `select`銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceRecoveryPanel.tsx`锛屾妸鍗＄墖鑽夌鍐欏叆 deck 鐨勯€夋嫨鍣ㄥ垏鍒板叡浜?`Select`锛岃ˉ榻愬浘璋卞埌澶嶄範闂幆閲岀殑楂橀涓嬫媺璇箟銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceShell.test.tsx`銆乣GraphWorkspaceSelectionPanel.test.tsx` 涓?`GraphWorkspaceRecoveryPanel.test.tsx`锛岄攣瀹氳繖浜涢€夋嫨鍣ㄧ幇鍦ㄩ兘浼氭毚闇插叡浜?`ds-select` 濂戠害锛岃€屼笉鍙槸淇濈暀鍘熷厛鐨?change 琛屼负銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Select 宸茶鐩栫瑪璁般€侀槄璇讳笌鍥捐氨宸ヤ綔鍖洪珮棰戜笅鎷夆€濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/components/GraphWorkspaceSelectionPanel.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栫瑪璁?闃呰琛ㄥ崟锛屽浘璋卞伐浣滃尯涓昏矾寰勯噷鐨勯珮棰戜笅鎷変篃寮€濮嬫秷璐瑰叡浜?`Select`锛岃繖璁╁悗缁户缁敹鍙ｆ洿澶氬浘璋辩紪杈戣〃鍗曞拰鍚庡彴绛涢€夊櫒鏇撮『銆?- 杩欎竴杞粛鐒跺彧鍏堣鐩栦簡鍥捐氨宸ヤ綔鍖虹殑 `select`锛涘浘璋遍〉澶撮鏋躲€佹洿澶?`input / textarea` 浠ュ強绠＄悊绔?`Select` 閫傞厤灞備粛鏈粺涓€锛屽悗缁洿閫傚悎缁х画娌胯繖浜涢噸澶嶇偣鎺ㄨ繘锛岃€屼笉鏄洖鍒板崟涓€娣卞眰閫昏緫閲嶆瀯銆?
## 2026-07-13 05:06:30 +08:00 | v1.1.0-alpha.172 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔垎浜〉椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鍩燂紝鑰屾槸鎶婄敤鎴风鍏紑鍒嗕韩椤电殑瑙ｆ瀽璺緞鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄 `SharePage` 涓嶅啀鎶婅В鏋愪腑鐨勫垎浜摼鎺ュ拰澶辨晥鍒嗕韩閾炬帴閮藉彧鐢ㄥ眬閮?`message` 鐩村嚭锛岃€屾槸鍦ㄩ灞忛樁娈垫槑纭繘鍏ュ叡浜?`loading / error`锛屽苟琛ヤ笂缁熶竴閲嶈瘯鍏ュ彛銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-user/src/pages/SharePage.test.tsx`锛屽厛浠?RED 閿佸畾涓変釜鐪熷疄缂哄彛锛氬垎浜〉棣栧睆娌℃湁鍏变韩 `loading`锛涘垎浜摼鎺ヨВ鏋愬け璐ユ椂娌℃湁鍏变韩 `error`锛涗粠鍏变韩閿欒鎬侀噸璇曞悗涔熸病鏈夊洖鍒版甯稿彧璇婚瑙堜笂涓嬫枃銆?- 鏇存柊 `frontend-user/src/pages/SharePage.tsx`锛屾柊澧?`SharePreviewState` 涓?`loadShare()`锛屾妸鍒嗕韩椤典富鍏ュ彛鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁細棣栧睆璇诲彇涓蛋 `loading`锛岃В鏋愬け璐ヨ蛋 `error`锛屾棤鍐呭鏃惰蛋鍏滃簳 `empty`銆?- 鍒嗕韩椤电幇鍦ㄤ細鍦ㄥ叡浜?`error / empty` 鐘舵€侀噷鎻愪緵缁熶竴鐨勨€滈噸鏂板姞杞解€濆姩浣滐紱鍙湁鍒嗕韩鍐呭鎴愬姛杩斿洖鍚庯紝椤甸潰鎵嶆樉绀哄彧璇婚瑙堝崱鐗囧拰鈥滄墦寮€鍘熷椤甸潰鈥濆叆鍙ｃ€?- 鏃㈡湁鍒嗕韩 API 濂戠害淇濇寔涓嶅彉锛屾湰杞彧鏀跺彛鍏紑鍙鍏ュ彛鐨勯〉闈㈢姸鎬佽涔夛紝涓嶆敼 `/api/v1/share/:token` 鐨勬暟鎹粨鏋勩€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/SharePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/SharePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪闄や簡鍙椾繚鎶ゅ伐浣滃尯锛屼篃鎶婂叕寮€鍙鍒嗕韩鍏ュ彛鎺ヨ繘浜嗗叡浜〉闈㈢姸鎬佸崗璁紝鐢ㄦ埛绔墿浣欌€滃彧闈犲眬閮?message 鐩村嚭鈥濈殑椤甸潰鍙堝皯浜嗕竴鍧椼€?- 鐢ㄦ埛绔悗缁洿閫傚悎缁х画娌垮浘璋卞伐浣滃彴銆侀槄璇绘鏌ュ櫒鎴栧彈淇濇姢杈圭晫琛ユ洿缁嗙矑搴︾殑 `unauthorized / conflict / stale` 鐪熷叆鍙ｏ紝鑰屼笉鏄噸鏂板洖鍒伴浂鏁ｉ〉闈㈡秷鎭彁绀恒€?
## 2026-07-13 05:01:30 +08:00 | v1.1.0-alpha.171 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔浘璋卞伐浣滃彴椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鍩燂紝鑰屾槸鎶婄敤鎴风鍥捐氨宸ヤ綔鍙扮殑棣栧睆鑷妇璺緞鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄 `GraphWorkspacePage` 涓嶅啀鎶婇灞忓姞杞戒腑涓庨灞忓け璐ラ兘浼鎴愨€滅┖鐢诲竷 + 鐘舵€佹爮鎻愮ず鈥濓紝鑰屾槸鍦ㄩ灞忛樁娈垫槑纭繘鍏ュ叡浜?`loading / error`锛屽苟鍦ㄥ凡鏈夊浘璋变笂涓嬫枃鏃舵妸閲嶆柊鑷妇澶辫触鎻愬崌涓哄叡浜?`stale`銆?### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 琛?RED锛岄攣瀹氫笁涓湡瀹炵己鍙ｏ細鍥捐氨宸ヤ綔鍙伴灞忔病鏈夊叡浜?`loading`锛涢灞忚嚜涓惧け璐ユ椂娌℃湁鍏变韩 `error`锛涗粠鍏变韩閿欒鎬侀噸璇曞悗涔熸病鏈夊洖鍒版甯稿伐浣滃彴涓婁笅鏂囥€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`GraphWorkspaceState` 涓?`workspaceLoadError`锛屾妸鍥捐氨宸ヤ綔鍙颁富鍏ュ彛鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁細棣栧睆璇诲彇涓蛋 `loading`锛岄灞忓け璐ヨ蛋 `error`锛屽凡鏈夊浘璋卞唴瀹规椂閲嶆柊鑷妇澶辫触璧?`stale`銆?- 鍥捐氨宸ヤ綔鍙扮幇鍦ㄤ細鍦ㄥ叡浜?`error / stale` 鐘舵€侀噷鎻愪緵缁熶竴鐨勨€滈噸鏂板姞杞解€濆姩浣滐紱棣栧睆澶辫触鏃朵笉鍐嶇户缁覆鏌撹瀵兼€х殑绌虹敾甯冿紝鑰屾槸鐩存帴鏆撮湶鍏变韩 `DataState`銆?- 鏃㈡湁鍐茬獊澶勭悊銆佷繚瀛樸€侀噸杞芥渶鏂板浘璋便€佹鏌ュ櫒涓庤祫婧愰潰鏉块摼璺繚鎸佷笉鍙橈紝鏈疆鍙敹鍙ｄ富宸ヤ綔鍙板叆鍙ｇ姸鎬佽涔夛紝涓嶆墿澶у浘璋辨帶鍒跺櫒鑱岃矗鑼冨洿銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡涓嶅彧瑕嗙洊棣栭〉銆佹悳绱€佽祫鏂欍€侀槄璇汇€佺瑪璁般€佸涔犮€丄I銆佺ぞ鍖哄拰璁剧疆椤碉紝鍥捐氨涓诲伐浣滃彴涔熸帴杩涗簡鍏变韩椤甸潰鐘舵€佸崗璁紝鐢ㄦ埛绔渶鏍稿績鐨勫涔犺垶鍙板張闂悎浜嗕竴娈点€?- 鍥捐氨宸ヤ綔鍙版洿缁嗙矑搴︾殑璧勬簮鍒囨崲銆佸眬閮ㄥ埛鏂颁互鍙?`unauthorized / conflict` 鐪熼〉闈㈠叆鍙ｄ粛鏈畬鍏ㄩ棴鍚堬紱鍚庣画鏇撮€傚悎缁х画娌垮浘璋卞伐浣滃彴鎴栭槄璇绘鏌ュ櫒閾捐矾琛ヨ繖浜涘墿浣欑姸鎬佽惤鐐广€?
## 2026-07-13 04:54:30 +08:00 | v1.1.0-alpha.170 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔缃〉椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鍩燂紝鑰屾槸鎶婄敤鎴风璁剧疆椤电殑 profile 璇诲彇璺緞鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄 `SettingsPage` 涓嶅啀鎶?profile 鑷妇澶辫触闈欓粯鍚炴帀锛岃€屾槸鍦ㄩ灞忛樁娈垫槑纭繘鍏ュ叡浜?`loading / error`锛屽苟琛ヤ笂缁熶竴鐨勯噸璇曞叆鍙ｃ€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-user/src/pages/SettingsPage.test.tsx`锛屽厛浠?RED 閿佸畾涓変釜鐪熷疄缂哄彛锛氳缃〉棣栧睆娌℃湁鍏变韩 `loading`锛沺rofile 璇诲彇澶辫触鏃堕潤榛樻棤鍙嶉锛涗粠鍏变韩閿欒鎬侀噸璇曞悗涔熸病鏈夊洖鍒版甯歌〃鍗曚笂涓嬫枃銆?- 鏇存柊 `frontend-user/src/pages/SettingsPage.tsx`锛屾柊澧?`SettingsProfileState` 涓?`loadProfile()`锛屾妸璁剧疆椤佃祫鏂欏尯鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁細棣栧睆璇诲彇涓蛋 `loading`锛宲rofile 璇诲彇澶辫触璧?`error`锛屾棤璧勬枡鏃惰蛋鍏滃簳 `empty`銆?- 璁剧疆椤电幇鍦ㄤ細鍦ㄥ叡浜?`error / empty` 鐘舵€侀噷鎻愪緵缁熶竴鐨勨€滈噸鏂板姞杞解€濆姩浣滐紱褰?profile 鎴愬姛杩斿洖鍚庯紝椤甸潰鎵嶆覆鏌撹祫鏂欒〃鍗曪紝閬垮厤绌虹櫧杈撳叆妗嗕吉瑁呮垚鈥滃凡鎴愬姛鍔犺浇鈥濈殑姝ｅ父鎬併€?- 鍘熸湁璧勬枡淇濆瓨閫昏緫淇濇寔涓嶅彉锛屼粛娌跨敤鏃㈡湁 `updateProfile(...)` API 鍜屾垚鍔?澶辫触鍙嶉锛屼笉鎵╁ぇ杩欐宸ヤ綔鍖呯殑濂戠害鑼冨洿銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-user run test -- src/pages/SettingsPage.test.tsx src/pages/CommunityPage.test.tsx src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡鎶婄敤鎴风棣栭〉銆佺ぞ鍖恒€佽祫鏂欏簱銆侀槄璇汇€佺瑪璁般€佸涔犮€丄I 宸ヤ綔鍙板拰璁剧疆椤甸兘鎺ヨ繘浜嗗叡浜〉闈㈢姸鎬佸崗璁紝鐢ㄦ埛绔墿浣欌€滃け璐ラ潤榛樺悶鎺夆€濈殑鍏ュ彛缁х画鍑忓皯銆?- 璁剧疆椤电殑淇濆瓨鎻愪氦娴佺▼浠嶆槸灞€閮?`message` 鍙嶉锛屽悗缁鏋滅户缁帹杩?`FE-040`锛屾洿閫傚悎琛ュ浘璋遍〉鎴栨洿缁嗙矑搴︾殑 `unauthorized / conflict` 鐪熷叆鍙ｏ紝鑰屼笉鏄湪杩欎竴姝ユ墿鏁ｅ埌鏂扮殑浜у搧鍩熴€?
## 2026-07-13 04:19:30 +08:00 | v1.1.0-alpha.165 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔瑪璁板伐浣滃尯 stale 椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鍩燂紝鑰屾槸鎶婄敤鎴风绗旇宸ヤ綔鍖虹殑鍒锋柊澶辫触璺緞鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄 `NotesPage` 鍦ㄩ娆″姞杞藉け璐ユ椂缁存寔娓呮櫚鐨勫叡浜?`error` 鐘舵€侊紝鍦ㄥ凡鏈夌瑪璁板垪琛ㄥ拰缂栬緫涓婁笅鏂囨椂鍒锋柊澶辫触杩涘叆鍏变韩 `stale`锛岄伩鍏嶇敤鎴峰垰淇濆瓨瀹屽氨琚墦鍥炵┖鐧藉伐浣滃尯銆?### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-user/src/pages/NotesPage.test.tsx` 琛?RED锛屽鐜扳€滅瑪璁颁繚瀛樺悗閲嶆柊鍚屾澶辫触浼氭竻绌哄垪琛ㄣ€佸綋鍓嶇瑪璁伴€€鍥炴柊寤鸿崏绋库€濈殑缂哄彛锛屽苟琛ラ灞?`error` 鐘舵€佸洖褰掋€?- 鏇存柊 `frontend-user/src/pages/NotesPage.tsx`锛屾柊澧?`NotesWorkspaceState` 涓?`loadAll({ preserveExisting })` 妯″紡锛岃绗旇鍒楄〃宸ヤ綔鍖哄紑濮嬬湡瀹炴秷璐瑰叡浜?`loading / error / empty / stale` 椤甸潰鐘舵€佸崗璁€?- 绗旇鍒涘缓銆佷繚瀛樼増鏈拰鎭㈠鐗堟湰鍦ㄦ垚鍔熸彁浜ゅ悗閮戒細灏濊瘯淇濈暀鏃у唴瀹瑰埛鏂帮紱濡傛灉鍒锋柊澶辫触锛屽乏渚т細娓叉煋鈥滅瑪璁板垪琛ㄩ渶瑕佸埛鏂扳€濈殑鍏变韩 `stale` 鐘舵€侊紝鍚屾椂缁х画淇濈暀鏃у垪琛ㄤ笌褰撳墠缂栬緫鍐呭銆?- 鍒犻櫎绗旇浠嶄繚鎸佸師鏉ョ殑涓ユ牸鍒锋柊璺緞锛屼笉鎶娾€滃凡鍒犻櫎浣嗗埛鏂板け璐モ€濈殑鎯呭喌璇覆鏌撴垚鍙户缁紪杈戠殑鏃х瑪璁帮紝閬垮厤璇箟娣锋穯銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/NotesPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/NotesPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡瑕嗙洊鐢ㄦ埛绔悳绱€佽祫鏂欏簱銆佸涔犲伐浣滃尯鍜岀瑪璁板伐浣滃尯锛岀敤鎴蜂富瀛︿範闂幆閲岀殑鍏变韩椤甸潰鐘舵€侀鏋舵洿瀹屾暣浜嗐€?- 闃呰椤典富鑸炲彴瀵?`getReaderState(...)` 澶辫触浠嶅亸鍚戦潤榛橀檷绾т负绌虹櫧闃呰鎬侊紝鍚庣画鏇撮€傚悎缁х画娌?`ReaderPage` 鎶?`error / stale` 鐨勭湡瀹炲叆鍙ｈˉ榻愩€?
## 2026-07-13 04:13:30 +08:00 | v1.1.0-alpha.164 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔涔犲伐浣滃尯椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鐨勯〉闈㈠煙锛屽彧琛ョ敤鎴风澶嶄範宸ヤ綔鍖哄鍏变韩椤甸潰鐘舵€佸崗璁殑鐪熷疄娑堣垂銆?- 鐩爣鏄 `ReviewWorkspacePage` 鍦ㄩ灞忚嚜涓惧け璐ユ椂杩涘叆鍏变韩 `error` 鐘舵€侊紝鍦ㄥ凡鏈夊涔犲崱鐗囩殑鍒锋柊澶辫触鏃惰繘鍏ュ叡浜?`stale` 鐘舵€侊紝鍚屾椂涓嶄涪鎺夌敤鎴锋鍦ㄥ鐞嗙殑鍗＄墖涓婁笅鏂囥€?### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx` 琛?RED锛屽鐜扳€滈灞忓け璐ヤ粛鍙樉绀?message + 绌烘€併€佸埛鏂板け璐ヤ笉杩涘叆 stale鈥濈殑缂哄彛锛屽苟琛?`cleanup()` 鏀跺彛锛岄伩鍏嶅墠涓€鏉＄敤渚嬫畫鐣?DOM 姹℃煋杩欎竴缁勭姸鎬佹柇瑷€銆?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屾柊澧?`ReviewWorkspaceState` 涓?`workspaceErrorMessage` 鍒ゅ畾锛屾妸澶嶄範宸ヤ綔鍖轰富鑸炲彴鎺ュ埌鍏变韩 `DataState` 鍗忚銆?- 褰撳墠澶嶄範宸ヤ綔鍖哄湪棣栨鍔犺浇澶辫触鏃朵細娓叉煋鈥滃涔犲伐浣滃彴鏆傛椂涓嶅彲鐢ㄢ€濈殑鍏变韩 `error` 鐘舵€侊紱褰撳凡鏈夊綋鍓嶅崱鐗囥€佸啀娆″埛鏂板け璐ユ椂锛屼細娓叉煋鈥滃涔犻槦鍒楅渶瑕佸埛鏂扳€濈殑鍏变韩 `stale` 鐘舵€侊紝骞剁户缁繚鐣欏綋鍓嶅崱鐗囧彲瑙併€?- 绌洪槦鍒楀満鏅粛淇濈暀甯︹€滃垱寤哄崱缁勨€濆姩浣滅殑鍏变韩 `empty` 鐘舵€侊紝涓嶆敼鍙樻棦鏈夊涔犵鐞嗗叆鍙ｄ笌 API 濂戠害銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪涓嶅彧瑕嗙洊鐢ㄦ埛绔悳绱㈤〉鍜岃祫鏂欏簱椤碉紝澶嶄範宸ヤ綔鍖轰富鑸炲彴涔熷凡缁忓紑濮嬬湡瀹炴秷璐瑰叡浜?`loading / error / empty / stale` 椤甸潰鐘舵€佸崗璁€?- 澶嶄範绠＄悊闈㈡澘鍐呴儴鐨勫崱缁?鍗＄墖鍒楄〃浠嶄富瑕佽鐩?`empty`锛岀敤鎴风鏇村椤甸潰鐨?`unauthorized / conflict` 鍏ュ彛涔熻繕娌℃湁闂悎锛涘悗缁洿閫傚悎娌块槄璇婚〉銆佺瑪璁伴〉鍜屽涔犵鐞嗛潰鏉跨户缁敹鍙ｃ€?
## 2026-07-13 03:38:10 +08:00 | v1.1.0-alpha.163 | 鎺ㄨ繘 FE-040 绠＄悊绔?unauthorized 椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鍋氭柊鐨勬不鐞嗗姩浣滐紝鑰屾槸琛ョ鐞嗙鐪熷疄 `unauthorized` 椤甸潰鐘舵€佸叆鍙ｃ€?- 鐩爣鏄瀹℃牳闃熷垪鍜屾不鐞嗘ā鍧楀湪 `403` 鏉冮檺澶辫触鏃舵槑纭繘鍏ュ叡浜?`DataState` 鐨?`unauthorized` 璇箟锛屽苟涓旀竻鎺変笉璇ョ户缁毚闇茬殑鏃ц〃鏍?/ 鏃ц鎯呫€?### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-admin/src/views/modules/AdminModerationModule.test.ts`銆乣AdminGovernanceModule.test.ts` 涓?`AdminWorkspaceView.test.ts` 琛?RED锛屽鐜扳€?03 鏃舵ā鍧楅〉浠嶅彧鏄剧ず stale / error锛屼笖鏃ф暟鎹繕浼氱户缁仠鐣欏湪椤甸潰涓娾€濈殑缂哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屼负瀹℃牳闃熷垪涓庢不鐞嗘ā鍧楄ˉ榻愮湡瀹?`403 -> unauthorized` 鐘舵€佹槧灏勶紱褰撳墠璇锋眰杩斿洖 `403` 鏃讹紝浼氳浆鎴愬叡浜?`DataState` 鐨?`unauthorized` 鏍囩涓庢潈闄愯鏄庛€?- 鍚屾椂鍦?`AdminWorkspaceView.vue` 钀戒簡鏈€灏忕殑鏁版嵁娓呯悊绛栫暐锛氬鏍搁槦鍒楀湪 `403` 鏃舵竻绌哄凡鏈夋潯鐩紝娌荤悊妯″潡鍦?`403` 鏃舵竻绌?rows / summary / selectedRecord / view 缁戝畾锛岄伩鍏嶆潈闄愭敹鍥炲悗浠嶇户缁毚闇叉棫鍐呭銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸鈥滀繚鐣欐棫琛ㄦ牸鈥濈殑鏉′欢杩涗竴姝ユ敹绱у埌 `stale` 涓撶敤璺緞锛沗loading / error / unauthorized / conflict` 閮戒笉鍐嶇户缁覆鏌撹褰曞尯銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
### 鍚庣画褰卞搷

- `FE-040` 鍦ㄧ鐞嗙宸茬粡涓嶅彧瑕嗙洊 `loading / error / empty / stale`锛宍unauthorized` 涔熻繘鍏ヤ簡鐪熷疄宸ヤ綔鍙伴〉闈㈠叆鍙ｏ紝鐘舵€佸崗璁洿鎺ヨ繎鈥滃彲鎿嶄綔銆佸彲瑙ｉ噴鈥濈殑缁熶竴楠ㄦ灦銆?- `conflict` 浠嶄富瑕佸仠鐣欏湪鍏变韩璇箟鍜屽浘璋变笓鐢ㄨ矾寰勶紝鍚庣画缁х画鎺ㄨ繘 `FE-040` 鏃讹紝鏇撮€傚悎鎸戠敤鎴风鍥捐氨鎴栬法绔叡浜〃鍗?鍒楄〃閲岀湡姝ｄ細鍑虹幇鍐茬獊鍐崇瓥鐨勫叆鍙ｇ户缁帴绾裤€?
## 2026-07-13 03:27:16 +08:00 | v1.1.0-alpha.162 | 鎺ㄨ繘 FE-040 绠＄悊绔?stale 椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 寤剁画 `CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戯紝鏈疆涓嶅洖鍒版洿绐勭殑娌荤悊鍔ㄤ綔锛岃€屾槸缁х画鏀跺彛鏇撮珮浼樺厛绾х殑 `FE-040` 椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄妸鍏变韩 `DataState` 閲岀殑 `stale` 璇箟浠庢灇涓惧拰鏍峰紡鎺ㄨ繘鍒扮鐞嗙鐪熷疄椤甸潰鍏ュ彛锛氬綋妯″潡宸茬粡鏈夋棫鏁版嵁銆佷絾鍒锋柊鍐嶆澶辫触鏃讹紝瑕佹樉寮忓憡璇夋搷浣滆€呪€滃綋鍓嶇湅鍒扮殑鏄檲鏃ф暟鎹€濓紝涓斾笉鑳芥妸鏃ц〃鏍肩洿鎺ュ悶鎺夈€?### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-admin/src/views/modules/AdminModerationModule.test.ts`銆乣AdminGovernanceModule.test.ts` 涓?`AdminWorkspaceView.test.ts` 琛?RED锛屽鐜扳€滃埛鏂板け璐ュ悗鏃㈡病鏈?shared stale state锛屼篃浼氫涪鎺夊凡鏈夊垪琛ㄢ€濈殑缂哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屼负瀹℃牳闃熷垪涓庢不鐞嗘ā鍧楄ˉ榻愮湡瀹?`stale` 鐘舵€佽浇鑽凤紱褰撳悓涓€璺敱涓嬪凡鏈夊垪琛ㄤ笖 refresh 澶辫触鏃讹紝浼氬垎鍒敓鎴愨€滃鏍搁槦鍒楅渶瑕佸埛鏂扳€濅笌鈥滄不鐞嗚褰曢渶瑕佸埛鏂扳€濈殑鍏变韩鐘舵€佹枃妗堛€?- 鍚屾椂鍦?`AdminWorkspaceView.vue` 鏂板 `governanceRowsView` 璺熻釜锛岄檺鍒垛€滀繚鐣欐棫琛ㄦ牸鈥濆彧鍙戠敓鍦ㄥ悓涓€娌荤悊瑙嗗浘鐨勫埛鏂板け璐ヨ矾寰勶紱璺ㄦā鍧楀垏鎹㈠け璐ユ椂浠嶅洖鍒扮┖鍒楄〃 / error 鐘舵€侊紝涓嶆贩鍏ヤ笂涓€涓ā鍧楃殑鏁版嵁銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛岃妯″潡椤靛湪 `stale` 鏃跺悓鏃舵覆鏌?`AdminDataState` 鍜屾棫琛ㄦ牸锛岃€屼笉鏄儚 `loading / error` 涓€鏍风洿鎺ユ浛鎹㈠唴瀹瑰尯銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪涓嶅啀鍙鐩栫鐞嗙鐨?`loading / error / empty`锛宍stale` 涔熷凡缁忚惤鍒扮湡瀹炲垪琛ㄥ埛鏂板け璐ヨ矾寰勶紝椤甸潰鐘舵€佸崗璁洿鎺ヨ繎鈥滅湡瀹炲彲鎿嶄綔鈥濈殑娌荤悊宸ヤ綔鍙般€?- `unauthorized / conflict` 浠嶄富瑕佸仠鐣欏湪鍏变韩鏂囨涓庡眬閮ㄦ彁绀哄眰锛屽悗缁户缁部 `FE-040` 鎺ㄨ繘鏃讹紝鏇撮€傚悎鎸戠敤鎴风鍥捐氨鎴栧悗鍙颁細璇濊竟鐣屼腑鐨勭湡瀹炲叆鍙ｏ紝鎶婅繖涓ょ被鐘舵€佷篃鎺ュ埌椤甸潰楠ㄦ灦閲屻€?
## 2026-07-10 00:41:30 +08:00 | v1.1.0-alpha.161 | 鏀跺彛 WB-032 鍥捐氨鍐茬獊鍙潬鎬ч獙璇?### 浠诲姟鍐呭

- 鎸?`CODEX_MASTER_PROMPT.md` 鐨勨€滄帴鎵嬫牳楠屽皬姝モ€濆厛鍋滄帀鏂扮殑 FE-041 鎺ョ嚎锛屾敼涓哄鏍稿綋鍓嶆洿楂樹紭鍏堢骇鐨?`VERIFY / IN_PROGRESS` 宸ヤ綔鍖呫€?- 鐢变簬 `FE-010`銆乣FE-020`銆乣FE-030`銆乣UI-04` 宸插湪 backlog 涓甫楠岃瘉璇佹嵁鏀跺彛锛屾湰杞洰鏍囪浆涓哄垽鏂?`WB-032` 鏄惁宸茬粡杈惧埌鍙叧闂竟鐣岋紝杩樻槸浠嶇己涓€涓渶灏忋€佸彲鎵ц鐨勫啿绐佸洖褰掑叆鍙ｃ€?### 瀹為檯鍙樻洿

- 杩愯 `npm run verify:graph-conflicts`锛屼覆琛屽鏍稿浘璋卞啿绐佸鐞嗙殑鍓嶇 Vitest銆佸悗绔?Go 娴嬭瘯銆佸浘璋卞伐浣滃尯 Playwright 鍥炲綊鍜屾枃妗ｅ悓姝ユ牎楠屻€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 浠?`IN_PROGRESS` 鏀跺彛涓?`DONE`锛屽苟琛ヤ竴鏉?2026-07-10 鐨勯獙璇佹墽琛岃褰曘€?- 鏈疆鏈敼鍔ㄤ笟鍔′唬鐮侊紱鏀跺彛鍔ㄤ綔鍙惤鍦?backlog / 浜や粯鏃ュ織锛岄伩鍏嶅湪娌℃湁鏂扮己鍙ｈ瘉鎹殑鎯呭喌涓嬬户缁墿鍐欏啿绐佸鐞嗗疄鐜般€?### 楠岃瘉缁撴灉

- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐜板湪鍙互瑙嗕负鈥滆嚜鍔ㄤ繚瀛?/ 蹇収 / 鍐茬獊澶勭悊鍙潬鎬р€濊繖涓€闃舵鐨勫疄鐜颁笌鍥炲綊閮藉凡闂悎锛屽悗缁笉蹇呭啀鎶婂畠褰撲綔杩涜涓殑涓婚樆濉為」銆?- 鍓╀綑鏇村畬鏁寸殑 create/save/restore/export/layout/conflict/鏉冮檺鐭╅樀銆佹洿澶氭闈?/ 绐勫睆缁勫悎涓庢潈闄愬垎鏀紝搴旂户缁斁鍦?`WB-034` 涓墿灞曪紝鑰屼笉鏄啀娆℃妸 `WB-032` 鎷夊洖鏈畬鎴愮姸鎬併€?
## 2026-07-10 00:33:10 +08:00 | v1.1.0-alpha.160 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?Input/Button 閫傞厤灞傛帴绾?### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓寖鍥村皬浣嗚鐩栭潰骞跨殑鍏变韩 primitive 鏀跺彛锛屼笉鍥炲ご娣辨寲鍗曚竴鍥捐氨鎴栧悗鍙版不鐞嗗姩浣溿€?- 鏈疆鐩爣鏄绠＄悊绔篃寮€濮嬬湡瀹炴秷璐瑰叡浜?`Input` / `Button` 濂戠害锛屼紭鍏堣鐩栫櫥褰曘€佸凡鐧诲綍澹冲眰銆乨ashboard CTA銆佸鏍告悳绱?鍔ㄤ綔鍜屾不鐞嗘悳绱?鍔ㄤ綔杩欎簺楂橀鐪熷疄鍏ュ彛銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminInput.vue` 涓?`AdminButton.vue`锛屼互 Vue 閫傞厤灞傛壙鎺ュ叡浜?`ds-input`銆乣primary/secondary/ghost`銆乣danger` 鍜岄粯璁?`type="button"` 璇箟锛屼笉寮鸿澶嶇敤 React 缁勪欢瀹炵幇銆?- 鏂板 `frontend-admin/src/components/admin/AdminInput.test.ts` 涓?`AdminButton.test.ts`锛屽厛鐢?RED 閿佸畾鈥滅鐞嗙鍏变韩杈撳叆/鎸夐挳閫傞厤灞傚繀椤诲瓨鍦ㄤ笖绗﹀悎鍏变韩濂戠害鈥濈殑缂哄彛锛屽啀鍦?GREEN 闃舵鍥哄畾榛樿绫诲瀷銆侀敊璇€?class 涓庣偣鍑?鏇存柊浜嬩欢銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminLoginPanel.vue`銆乣AdminShellFrame.vue`銆乣AdminConfirmDialog.vue`锛屾妸鐧诲綍杈撳叆銆佺櫥褰曟彁浜ゃ€佸埛鏂般€侀€€鍑哄拰纭灞傛寜閽垏鍒版柊鐨?Vue 閫傞厤灞傘€?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.vue`銆乣AdminModerationModule.vue` 涓?`AdminGovernanceModule.vue`锛屾妸 dashboard CTA銆佸鏍?娌荤悊鎼滅储妗嗗拰娌荤悊鍔ㄤ綔鎸夐挳鍒囧埌绠＄悊绔叡浜?`Input/Button` 閫傞厤灞傘€?- 鏇存柊 `frontend-admin/src/components/admin/admin.css`锛岃ˉ榻?`ghost-button` 涓?`danger` class 璇箟锛岃绠＄悊绔牱寮忓拰鍏变韩 `Button` 濂戠害淇濇寔涓€鑷达紝涓嶅啀鍙緷璧栧眬閮?`is-danger`銆?- 鏇存柊鐩稿叧绠＄悊绔祴璇曟枃浠讹紝閿佸畾杩欎簺鐪熷疄椤甸潰鍏ュ彛宸茬粡寮€濮嬫秷璐瑰叡浜?`ds-input` / `ghost-button` / `danger` 璇箟锛岃€屼笉鏄户缁覆鏌撹８ `input` / `button`銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminInput.test.ts src/components/admin/AdminButton.test.ts src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminInput.test.ts src/components/admin/AdminButton.test.ts src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栫敤鎴风 React 椤甸潰锛涚鐞嗙涔熷凡缁忓紑濮嬮€氳繃 Vue 閫傞厤灞傛秷璐瑰悓涓€濂?`Input` / `Button` 璇箟锛岃繖璁╁悗缁户缁敹鍙?`Select`銆佺瓫閫夋潯鍜屾洿澶氭不鐞嗗姩浣滄椂鎴愭湰鏇翠綆銆?- 杩欎竴杞粛鐒跺彧瑕嗙洊浜嗙鐞嗙楂橀 `Input/Button` 鍏ュ彛锛涘鑸寜閽€佹洿澶氳〃鏍间氦浜掑拰澶嶆潅绛涢€夌粨鏋勮繕娌℃湁缁熶竴鏀惰繘鍏变韩灞傦紝鍚庣画鏇撮€傚悎缁х画娌?`FE-041 / ADM-010 / ADM-011` 鎺ㄨ繘銆?
## 2026-07-09 14:51:28 +08:00 | v1.1.0-alpha.159 | 鎺ㄨ繘 FE-040 绠＄悊绔〉闈㈢姸鎬佸崗璁帴绾?### 浠诲姟鍐呭

- 缁х画娌?`FE-040` 鎺ㄨ繘鈥滈〉闈㈢姸鎬佸崗璁€濊繖鏉℃洿鍋忓叏灞€楠ㄦ灦鐨勫伐浣滅嚎锛岃繖娆′笉鍐嶆墿 token锛岃€屾槸琛ョ鐞嗙瀵瑰叡浜?`DataState` 璇箟鐨勭湡瀹炴秷璐广€?- 鏈疆鐩爣鏄妸鍚庡彴妯″潡椤佃嚦灏戝厛鎺ヤ笂 `loading / error / empty` 杩欎笁绫诲叡浜姸鎬侊紝閬垮厤鐢ㄦ埛绔凡缁忕粺涓€銆佺鐞嗙杩樼户缁悇鑷墜鍐欑┖鎬佸潡涓庡眬閮ㄦ彁绀恒€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminDataState.vue` 涓?`frontend-admin/src/components/admin/dataState.ts`锛岃绠＄悊绔紑濮嬬洿鎺ユ秷璐?`@studymate/ui` 鐨?`DataStateKind` / `getDataStateLabel(...)`锛屼互 Vue 閫傞厤灞傛壙鎺ュ叡浜姸鎬佽涔夈€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛屾ā鍧楅〉鐜板湪浼氫紭鍏堟覆鏌撳叡浜姸鎬侀鏋讹紱褰撲紶鍏?`dataState` 鏃舵樉绀?`loading / error`锛屽綋鍒楄〃涓虹┖鏃剁粺涓€鍥炶惤鍒板叡浜?`empty` 鐘舵€侊紝鑰屼笉鏄户缁娇鐢ㄥ悇鑷垎鍙夌殑绌烘€?DOM銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屼负瀹℃牳闃熷垪鍜屾不鐞嗚褰曡ˉ涓婃渶灏忕姸鎬佽浇鑽烽€忎紶锛氬垪琛ㄥ皻鏃犳暟鎹椂锛屽伐浣滃彴浼氭牴鎹綋鍓?`loading/error` 鐘舵€佺敓鎴愬叡浜?`dataState` 骞朵氦缁欐ā鍧楅〉娑堣垂銆?- 鍚屾椂鏇存柊 `frontend-admin/tsconfig.json`锛岃ˉ榻?`jsx: "preserve"`锛岃В鍐崇鐞嗙鐩存帴娑堣垂 `@studymate/ui` 瀵煎嚭鏃?`vue-tsc` 鏃犳硶瑙ｆ瀽鍖呭唴 `.tsx` 鍏ュ彛鐨勯棶棰樸€?- 鏇存柊 `frontend-admin/src/components/admin/admin.css` 涓庣浉鍏虫祴璇曟枃浠讹紝鎶婅繖鏉＄姸鎬佸崗璁ˉ鎴愮湡瀹炲彲鍥炲綊鐨勭鐞嗙鍒囩墖銆?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡浠庘€滃叡浜?token 鍗曚竴鏉ユ簮鈥濊繘涓€姝ユ帹杩涘埌鈥滅鐞嗙寮€濮嬬湡瀹炴秷璐瑰叡浜〉闈㈢姸鎬佽涔夆€濓紝杩欐洿鎺ヨ繎鈥滃厛鎶婂叏灞€楠ㄦ灦琛ラ綈鈥濈殑鐩爣銆?- 杩欐鍏堣鐩栫殑鏄悗鍙版ā鍧楅〉鐨?`loading / error / empty` 棣栧眰鍗忚锛涘悗缁鏋滅户缁墿 `unauthorized / stale / conflict`锛屽凡缁忔湁浜嗗彲澶嶇敤鐨?Vue 渚х姸鎬侀€傞厤灞備笌椤甸潰鍏ュ彛銆?
## 2026-07-09 14:34:33 +08:00 | v1.1.0-alpha.158 | 鎵╁厖 WB-032 latest-head 鍒嗙粍渚濊禆鍥哄畾鍏ュ彛 E2E
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁浐瀹氶獙璇佸叆鍙ｏ紝杩欐鑱氱劍鈥渓atest-head 鍒犻櫎璇箟涓嬬殑鍒嗙粍渚濊禆闃绘柇鈥濊繖鏉￠〉闈㈢骇宸茬粡閿佸畾銆佷絾鍥哄畾鍏ュ彛杩樻病鏈夎鐩栫殑鐪熷疄娴忚鍣ㄨ矾寰勩€?- 鏈疆鐩爣鏄妸鈥滄湰鍦拌崏绋挎仮澶?-> latest-head 鏂板 `Server node` 涓?`Server group` -> 涓€閿簲鐢?2 椤硅仈鍔ㄥ彇鑸嶅缓璁?-> 搴旂敤宸叉爣璁板彇鑸?-> 鍐嶆淇濆瓨鈥濇帴杩?`verify:graph-conflicts`锛岄伩鍏嶈繖鏉″垎缁勪緷璧栦富绾垮彧鍋滅暀鍦ㄩ〉闈㈢骇鍥炲綊閲屻€?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧?Playwright 鐢ㄤ緥瑕嗙洊鐪熷疄 `graph_version_conflict` 鍚庣殑 latest-head 鍒嗙粍渚濊禆璺緞锛氭湰鍦拌崏绋夸繚鎸佸彧鏈?`Graph root`锛屾湇鍔＄鏈€鏂扮増鏈澶栧寘鍚?`Server node` 涓庡紩鐢ㄥ畠鐨?`Server group`锛岄殢鍚庡湪鍐茬獊鍗＄墖涓厛璇€夆€滀繚鐣欐湰鍦拌妭鐐瑰垹闄?+ 淇濈暀鏈嶅姟绔垎缁勫垹闄も€濄€?- 杩欐潯鏂?E2E 浼氬厛閿佸畾闃绘柇鎻愮ず鈥滃垎缁?`Server group` 浠嶅紩鐢ㄦ湭淇濈暀鐨勮妭鐐光€濓紝鍐嶆牴鎹湡瀹炴祻瑙堝櫒鍚堝悓鏂█涓ゆ潯鑱斿姩寤鸿鍒嗗埆鏄€滆仈鍔ㄤ繚鐣欐湇鍔＄锛氳妭鐐癸綔鍒犻櫎锝淪erver node鈥濆拰鈥滆仈鍔ㄤ繚鐣欐湰鍦帮細鍒嗙粍锝滃垹闄わ綔Server group鈥濓紝闅忓悗涓€閿簲鐢?2 椤硅仈鍔ㄥ彇鑸嶅缓璁苟缁х画淇濆瓨銆?- 鍚屼竴涓敤渚嬭繕浼氭崟鑾风浜屾 `batch-save` 璇锋眰锛屾柇瑷€鎻愪氦鐨勬槸 rebased `document.version = 5`锛屽苟涓旀渶缁堜繚瀛樼粨鏋滅鍚堝綋鍓?latest-head 鍒嗙粍渚濊禆鍚堝悓锛氫繚鐣?`Graph root` 涓?`Server node`锛屽悓鏃舵寜鏈湴鍒犻櫎 `Server group`锛屽舰鎴?`2 鑺傜偣 / 0 鍒嗙粍 / 0 杩炵嚎` 鐨勫悎骞惰崏绋裤€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛屾妸杩欐潯鏂板鍥哄畾鍏ュ彛璺緞琛ュ洖 `WB-032` 鐨勬墽琛岃褰曞拰鍥捐氨鍐茬獊鍥炲綊鐭╅樀銆?### 楠岃瘉缁撴灉

- `npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace can clear latest-head group dependency blockers and save the rebased draft"`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄥ凡缁忓紑濮嬭鐩?latest-head 鍒嗙粍渚濊禆鑱斿姩娓呴樆鏂悗鐨勭湡瀹炴祻瑙堝櫒閾捐矾锛涘悗缁鏋滅户缁墿 latest-head 澶氱洰鏍囧垹闄よ涔夋垨鏇村缁勭骇渚濊禆闃绘柇锛屽彲浠ョ洿鎺ユ部杩欐潯 E2E 涓荤嚎琛ュ厖銆?- 杩欐娌℃湁淇敼鍐茬獊澶勭悊杩愯鏃惰涔夛紝鏂板鐢ㄤ緥鍦ㄧ幇鏈夊疄鐜颁笂鐩存帴 GREEN锛岃鏄庨〉闈㈢骇宸茬粡閿佸畾鐨?latest-head 鍒嗙粍鑱斿姩鍚堝悓鐜板湪涔熻鎻愬崌鍒颁簡 Playwright 鍥哄畾鍏ュ彛閲屻€?
## 2026-07-09 14:25:00 +08:00 | v1.1.0-alpha.157 | 鎵╁厖 WB-032 澶氱洰鏍囨湰鍦拌繛绾胯仈鍔ㄥ缓璁悗鐨勫浐瀹氬叆鍙?E2E
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁浐瀹氶獙璇佸叆鍙ｏ紝杩欐鑱氱劍鈥滄湰鍦板鐩爣杩炵嚎瑙﹀彂鑱斿姩寤鸿鈥濊繖鏉￠〉闈㈢骇宸茬粡閿佸畾銆佷絾鍥哄畾鍏ュ彛杩樻病鏈夎鐩栫殑鐪熷疄娴忚鍣ㄨ矾寰勩€?- 鏈疆鐩爣鏄妸鈥滄湰鍦拌崏绋挎仮澶?-> 澶氱洰鏍囪繛绾胯Е鍙?`graph_version_conflict` -> 涓€閿簲鐢?3 椤硅仈鍔ㄥ彇鑸嶅缓璁?-> 搴旂敤宸叉爣璁板彇鑸?-> 鍐嶆淇濆瓨鈥濇帴杩?`verify:graph-conflicts`锛岄伩鍏嶅鐩爣渚濊禆杩欐潯涓荤嚎鍙仠鐣欏湪椤甸潰绾у洖褰掗噷銆?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧?Playwright 鐢ㄤ緥瑕嗙洊鍚屽浘璋卞悓鐗堟湰鑽夌鎭㈠鍚庣殑澶氱洰鏍囨湰鍦拌繛绾胯矾寰勶細鏈湴鑽夌涓柊澧?`Local concept`銆乣Extra target node` 涓や釜鑺傜偣锛屽苟閫氳繃 `metadata.targetNodeIds` 鎸備竴鏉″鐩爣 `Local edge`锛岀劧鍚庢晠鎰忚Е鍙?`graph_version_conflict`銆?- 杩欐潯鏂?E2E 浼氬厛閿佸畾鍐茬獊鍗＄墖閲岀殑涓ゆ潯鈥滆仈鍔ㄤ繚鐣欐湰鍦扳€濊妭鐐瑰缓璁拰 `涓€閿簲鐢?3 椤硅仈鍔ㄥ彇鑸嶅缓璁甡锛屽啀鏍规嵁鐪熷疄娴忚鍣ㄥ悎鍚屾柇瑷€鎵归噺寤鸿缁撴灉鏄€滀繚鐣欐湰鍦?2 椤广€佷繚鐣欐湇鍔＄ 1 椤光€濓紝闅忓悗搴旂敤宸叉爣璁板彇鑸嶅苟鍐嶆淇濆瓨銆?- 鍚屼竴涓敤渚嬭繕浼氭崟鑾风浜屾 `batch-save` 璇锋眰锛屾柇瑷€鎻愪氦鐨勬槸 rebased `document.version = 5`锛屽苟涓旀渶缁堜繚瀛樼粨鏋滅鍚堝綋鍓嶅鐩爣鑱斿姩鍚堝悓锛氫繚鐣欎袱涓湰鍦扮洰鏍囪妭鐐癸紝鍥為€€鏈湴澶氱洰鏍囪繛绾匡紝褰㈡垚 `3 鑺傜偣 / 0 杩炵嚎` 鐨勫悎骞惰崏绋裤€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛屾妸杩欐潯鏂板鍥哄畾鍏ュ彛璺緞琛ュ洖 `WB-032` 鐨勬墽琛岃褰曞拰鍥捐氨鍐茬獊鍥炲綊鐭╅樀銆?### 楠岃瘉缁撴灉

- RED锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace can batch-apply multi-target linked suggestions and save the rebased draft"`
- GREEN锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace can batch-apply multi-target linked suggestions and save the rebased draft"`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄥ凡缁忓紑濮嬭鐩栧鐩爣鏈湴杩炵嚎鐨勭湡瀹炴祻瑙堝櫒閾捐矾锛屽悗缁嫢缁х画鎵?`latest-head` 澶氱洰鏍囧垹闄よ涔夋垨鏇村鏉傜殑渚濊禆鑱斿姩锛屽凡缁忔湁涓€鏉℃洿璐磋繎鐪熷疄浜哄伐鍚堝苟鐨?E2E 鍩哄骇鍙户缁墿灞曘€?- 杩欐娌℃湁淇敼鍐茬獊澶勭悊杩愯鏃惰涔夛紝涓昏鏄妸椤甸潰绾у凡缁忓瓨鍦ㄧ殑澶氱洰鏍囪仈鍔ㄥ缓璁祦绋嬫彁鍗囧埌浜?Playwright 鍥哄畾鍏ュ彛閲岋紝闄嶄綆鍚庣画鍙潬灞€閮ㄦ祴璇曞彂鐜板洖褰掔殑椋庨櫓銆?
## 2026-07-09 14:14:00 +08:00 | v1.1.0-alpha.156 | 鎵╁厖 WB-032 鏈爣璁板璞￠粯璁ゅ洖閫€鍚庣殑鍥哄畾鍏ュ彛 E2E
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁浐瀹氶獙璇佸叆鍙ｏ紝杩欐鑱氱劍鈥滃彧鏍囪閮ㄥ垎瀵硅薄绾у彇鑸嶆椂锛屽墿浣欐湭鏍囪瀵硅薄榛樿娌跨敤鏈€鏂扮増鏈€濈殑鐪熷疄娴忚鍣ㄨ矾寰勩€?- 鏈疆鐩爣鏄妸鈥滄湇鍔＄宸插垹闄ゆ棫杩炵嚎 + 鏈湴鏂板鑺傜偣 + 鍙爣璁版湰鍦版柊鑺傜偣 -> 鏈爣璁板璞℃寜 latest head 榛樿鍥為€€ -> 鍐嶆淇濆瓨鈥濇帴杩?`verify:graph-conflicts`锛岄伩鍏嶆湭鏍囪榛樿鍥為€€杩欐潯涓荤嚎鍙仠鐣欏湪椤甸潰绾ч妫€鎻愮ず閲屻€?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧?Playwright 鐢ㄤ緥瑕嗙洊鐪熷疄 `graph_version_conflict` 鍚庣殑鏈爣璁伴粯璁ゅ洖閫€璺緞锛氬厛璁╂湇鍔＄鐗堟湰鍒犻櫎 `鏃у叧绯籤锛屾湰鍦板啀鏂板 `鏂版蹇礰 鑺傜偣锛屽彧鏍囪淇濈暀鏈湴鑺傜偣锛岄殢鍚庡簲鐢ㄥ凡鏍囪鍙栬垗骞跺啀娆′繚瀛樸€?- 杩欐潯鏂?E2E 浼氬厛閿佸畾鍐茬獊鍗＄墖閲岀殑鈥滆繕鏈?3 涓璞″皻鏈爣璁板彇鑸嶁€濅笌鈥滃彟澶?2 涓湭鏍囪瀵硅薄浼氶粯璁ゆ部鐢ㄦ渶鏂板浘璋辩増鏈€濇彁绀猴紝鍐嶆崟鑾风浜屾 `batch-save` 璇锋眰锛屾柇瑷€鏈€缁堟彁浜ょ殑鏄?rebased `document.version = 5`锛屽苟涓斾繚瀛樼粨鏋滅鍚堥粯璁ゅ洖閫€鍚堝悓锛氫繚鐣?`Graph root` 涓?`鏂版蹇礰 涓や釜鑺傜偣锛屽悓鏃剁Щ闄ゆ湭鏍囪鐨?`鏃у叧绯籤 杩炵嚎銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛屾妸杩欐潯鏂板鍥哄畾鍏ュ彛璺緞琛ュ洖 `WB-032` 鐨勬墽琛岃褰曞拰鍥捐氨鍐茬獊鍥炲綊鐭╅樀銆?### 楠岃瘉缁撴灉

- RED锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace falls back unmarked conflict objects to the latest head when applying marked resolutions"`
- GREEN锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace falls back unmarked conflict objects to the latest head when applying marked resolutions"`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄥ凡缁忓紑濮嬭鐩栤€滄湭鏍囪瀵硅薄榛樿娌跨敤鏈€鏂扮増鏈€濈殑鐪熷疄娴忚鍣ㄩ摼璺紝鍚庣画濡傛灉缁х画鎵?latest-head 澶氱洰鏍囦緷璧栥€佹湭鏍囪瀵硅薄绀轰緥鏂囨鎴栭粯璁ゅ洖閫€璇箟锛屽彲浠ョ洿鎺ユ部杩欐潯 E2E 涓荤嚎琛ュ厖銆?- 杩欐娌℃湁淇敼鍐茬獊澶勭悊杩愯鏃惰涔夛紝涓昏鏄妸椤甸潰绾у凡缁忓瓨鍦ㄧ殑鏈爣璁伴粯璁ゅ洖閫€棰勬涓庝繚瀛樼粨鏋滄彁鍗囧埌浜?Playwright 鍥哄畾鍏ュ彛閲岋紝闄嶄綆鍚庣画鍙潬灞€閮ㄦ祴璇曞厹搴曠殑椋庨櫓銆?
## 2026-07-09 14:07:00 +08:00 | v1.1.0-alpha.155 | 鎵╁厖 WB-032 鑱斿姩鍙栬垗寤鸿娓呴樆鏂悗鐨勫浐瀹氬叆鍙?E2E
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁浐瀹氶獙璇佸叆鍙ｏ紝杩欐涓嶅啀鍙湅鈥滃凡鏍囪鍙栬垗鐩存帴搴旂敤鈥濓紝鑰屾槸琛ヤ笂涓€鏉℃洿璐磋繎鐪熷疄浜哄伐鍚堝苟杈呭姪鐨勬祻瑙堝櫒涓昏矾寰勩€?- 鏈疆鐩爣鏄妸鈥滄湰鍦拌崏绋挎仮澶?-> `dangling_edge` 闃绘柇 -> 涓€閿簲鐢ㄨ仈鍔ㄥ彇鑸嶅缓璁?-> 搴旂敤宸叉爣璁板彇鑸?-> 鍐嶆淇濆瓨鈥濇帴杩?`verify:graph-conflicts`锛岄伩鍏嶈仈鍔ㄥ缓璁繖鏉′富绾垮彧鍋滅暀鍦ㄩ〉闈㈢骇鍥炲綊閲屻€?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧?Playwright 鐢ㄤ緥瑕嗙洊鍚屽浘璋卞悓鐗堟湰鑽夌鎭㈠鍚庣殑鍐茬獊淇濆瓨璺緞锛氬厛鏁呮剰瑙﹀彂 `graph_version_conflict`锛屽啀瀵?`Local edge` 鏂藉姞瀵硅薄绾у彇鑸嶏紝鍒╃敤鑱斿姩寤鸿涓€閿ˉ榻愪緷璧栧彇鑸嶏紝鏈€鍚庡簲鐢ㄥ悎骞惰崏绋垮苟鍐嶆淇濆瓨銆?- 杩欐潯鏂?E2E 浼氭崟鑾风浜屾 `batch-save` 璇锋眰锛屾柇瑷€鎻愪氦鐨勬槸 rebased `document.version = 5`锛屽苟涓旀渶缁堟彁浜ょ粨鏋滅鍚堣仈鍔ㄥ缓璁殑鐪熷疄鍚堝悓锛氫繚鐣欐湰鍦拌妭鐐?`Local concept`锛屽洖閫€鏈湴杩炵嚎 `Local edge`锛屽舰鎴?`2 鑺傜偣 / 0 杩炵嚎` 鐨勫悎骞惰崏绋裤€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛屾妸杩欐潯鏂板鍥哄畾鍏ュ彛璺緞琛ュ洖 `WB-032` 鐨勬墽琛岃褰曞拰鍥捐氨鍐茬獊鍥炲綊鐭╅樀銆?### 楠岃瘉缁撴灉

- RED锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace can batch-apply linked conflict suggestions, clear blockers, and save the rebased draft"`
- GREEN锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace can batch-apply linked conflict suggestions, clear blockers, and save the rebased draft"`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄤ笉浠呰鐩栤€滃啿绐佸悗閲嶈浇鏈€鏂板浘璋扁€濆拰鈥滃啿绐佸悗鐩存帴搴旂敤宸叉爣璁板彇鑸嶅啀淇濆瓨鈥濓紝涔熷紑濮嬭鐩栤€滀緷璧栭樆鏂?-> 鑱斿姩寤鸿 -> 鍚堝苟淇濆瓨鈥濈殑鐪熷疄娴忚鍣ㄩ摼璺紝鍚庣画缁х画鎵╁鐩爣渚濊禆鎴栨湭鏍囪榛樿鍥為€€鏃讹紝鏈変簡鏇磋创杩戠湡瀹炰汉宸ュ悎骞剁殑 E2E 鍩哄骇銆?- 杩欐娌℃湁淇敼鍐茬獊澶勭悊杩愯鏃惰涔夛紝涓昏鏄妸椤甸潰绾у凡缁忓瓨鍦ㄧ殑鑱斿姩寤鸿娓呴樆鏂祦绋嬫彁鍗囧埌浜?Playwright 鍥哄畾鍏ュ彛閲岋紝闄嶄綆鍚庣画閲嶆瀯鏃跺彧闈犲眬閮ㄦ祴璇曞彂鐜板洖褰掔殑椋庨櫓銆?
## 2026-07-09 13:58:00 +08:00 | v1.1.0-alpha.154 | 鎵╁厖 WB-032 瀵硅薄绾у彇鑸嶅簲鐢ㄥ悗鐨勫浐瀹氬叆鍙?E2E
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎺ㄨ繘鍐茬獊澶勭悊鍥哄畾楠岃瘉鍏ュ彛锛屼絾杩欐涓嶅啀鍙鐩栤€滃啿绐佸悗閲嶈浇鏈€鏂板浘璋扁€濓紝鑰屾槸琛ヤ笂涓€鏉℃洿璐磋繎瀵硅薄绾у啿绐佷富绾跨殑鐪熷疄娴忚鍣ㄨ矾寰勩€?- 鏈疆鐩爣鏄妸鈥滄爣璁板璞＄骇鍙栬垗 -> 搴旂敤宸叉爣璁板彇鑸嶅埌褰撳墠鑽夌 -> 浠?rebased document 鍐嶆淇濆瓨鈥濇帴杩?`verify:graph-conflicts`锛岄伩鍏嶈繖鏉″叧閿摼璺彧鍦ㄩ〉闈㈢骇娴嬭瘯閲屽瓨鍦ㄣ€佸浐瀹氬叆鍙ｈ繕鐪嬩笉鍒般€?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧?Playwright 鐢ㄤ緥瑕嗙洊鐪熷疄 `graph_version_conflict` 鍚庣殑瀵硅薄绾у彇鑸嶅簲鐢ㄨ矾寰勶細鍏堜繚鐣欐湰鍦版柊澧炶妭鐐癸紝鍐嶅簲鐢ㄥ凡鏍囪鍙栬垗鐢熸垚鍚堝苟鑽夌锛屾渶鍚庡啀娆＄偣鍑讳繚瀛樸€?- 杩欐潯鏂?E2E 涓嶅彧鐪嬮〉闈㈡彁绀猴紝杩樹細鎹曡幏绗簩娆?`batch-save` 璇锋眰锛屾柇瑷€鎻愪氦鐨勬槸 rebased `document.version = 5`锛屽苟涓旇姹備綋閲屽甫鏈変繚鐣欎笅鏉ョ殑鏈湴鑺傜偣鏍囬 `鏂版蹇礰銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛屾妸杩欐潯鏂板鍥哄畾鍏ュ彛璺緞琛ュ洖 `WB-032` 鐨勬墽琛岃褰曞拰鍥捐氨鍐茬獊鍥炲綊鐭╅樀銆?### 楠岃瘉缁撴灉

- RED锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace applies marked conflict resolutions onto the latest head and saves the rebased draft"`
- GREEN锛歚npm run build:user; npm run build:admin; npx playwright test e2e/v1-graph-workspace.spec.ts -g "graph workspace applies marked conflict resolutions onto the latest head and saves the rebased draft"`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄤ笉鍐嶅彧楠岃瘉鈥滃啿绐佸悗鏀惧純骞堕噸杞解€濓紝涔熷紑濮嬭鐩栤€滃啿绐佸悗淇濈暀閮ㄥ垎鏈湴淇敼骞剁户缁繚瀛樷€濈殑涓昏矾寰勶紝鍚庣画琛ユ洿澶氬璞¤仈鍔ㄤ笌鏈爣璁伴粯璁ゅ洖閫€鍦烘櫙鏃讹紝鍙互鐩存帴娌胯繖鏉?E2E 涓荤嚎鎵╁睍銆?- 杩欐娌℃湁鏀瑰彉鍐茬獊澶勭悊杩愯鏃惰涔夛紝涓昏鏄妸椤甸潰绾у凡缁忓瓨鍦ㄧ殑瀵硅薄绾у彇鑸嶄繚瀛橀摼璺彁鍗囧埌浜?Playwright 鍥哄畾鍏ュ彛閲岋紝闄嶄綆鍚庣画閲嶆瀯鏃跺彧闈犲眬閮ㄦ祴璇曞厹搴曠殑椋庨櫓銆?
## 2026-07-09 13:46:00 +08:00 | v1.1.0-alpha.153 | 鏀跺彛 WB-032 鍥捐氨鍐茬獊閲嶈浇纭鐨?E2E 鍚堝悓
### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鏀跺彛鍥捐氨鍐茬獊涓荤嚎锛屼絾杩欐涓嶆墿瀹炵幇杈圭晫锛屽彧淇浐瀹氶獙璇佸叆鍙ｉ噷宸茬粡钀藉悗鐨勬祴璇曞悎鍚屻€?- 鏈疆鐩爣鏄 `verify:graph-conflicts` 涓殑 Playwright 鍥炲綊涓庡綋鍓嶅叡浜?`ConfirmDialog` 琛屼负閲嶆柊瀵归綈锛岄伩鍏嶁€滃疄鐜板凡鍒囧埌浜屾纭锛孍2E 浠嶆寜鏃х殑鐩存帴閲嶈浇璺緞鏂█鈥濇寔缁樆濉炲伐浣滃寘楠屾敹銆?### 瀹為檯鍙樻洿

- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屽湪涓ゆ潯鐪熷疄 `graph_version_conflict` 璺緞閲岃ˉ榻愬叡浜‘璁ゅ脊绐椾氦浜掞細鐐瑰嚮 `鏀惧純鏈湴骞堕噸杞芥渶鏂板浘璋盽 鍚庯紝鍏堟柇瑷€鍑虹幇 `纭閲嶈浇鏈€鏂板浘璋盽锛屽啀鐐瑰嚮 `纭閲嶈浇` 杩涘叆鎴愬姛閲嶈浇娴佺▼銆?- 鍚屼竴浠?E2E 鐜板湪鍚屾椂閿佸畾甯歌瑙嗗彛涓庣獎灞忚鍙ｇ殑鍐茬獊閲嶈浇璺緞锛岀‘淇濃€滃啿绐佽緟鍔╁崱鐗囧彲瑙佷笖鍏变韩纭寮圭獥鍙揪鈥濅笉浼氬彧鍦ㄦ闈㈠搴︿笅鎴愮珛銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`PROJECT_LOG.md`锛屾妸杩欐鍥哄畾鍏ュ彛鍚堝悓瀵归綈鍜岄獙璇佺粨鏋滆ˉ鍥?`WB-032` 鐨勬墽琛岃褰曘€?### 楠岃瘉缁撴灉

- `npm run test:graph:conflicts:e2e`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `WB-032` 鐨勫浐瀹氬叆鍙ｇ幇鍦ㄩ噸鏂板洖鍒板叏缁匡紝鍚庣画鍙互缁х画鎶婄簿鍔涙斁鍦ㄥ璞＄骇鍐茬獊鍙栬垗鍜屾洿瀹屾暣鐨勪汉宸ュ悎骞惰緟鍔╋紝鑰屼笉鏄弽澶嶅崱鍦ㄨ繃鏈熺殑 E2E 鍚堝悓涓娿€?- 杩欐鍙榻愭祴璇曚笌鐜版湁瀹炵幇锛屾病鏈夋敼鍙樺浘璋卞啿绐佸鐞嗙殑杩愯鏃惰涔夛紱濡傛灉鍚庣画缁х画婕旇繘閲嶈浇纭鏂囨鎴栦氦浜掞紝璁板緱鍚屾鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛岄伩鍏嶅啀娆″嚭鐜扳€滈〉闈㈡祴璇曞凡璺熶笂銆佸浐瀹氬叆鍙?E2E 杩樺仠鐣欏湪鏃у悎鍚屸€濈殑鍒嗗弶銆?
## 2026-07-09 13:04:11 +08:00 | v1.1.0-alpha.152 | 鏀跺彛 API-011 / ADM-011 鐨?403 user_disabled 鍓嶇浼氳瘽鑱斿姩
### 浠诲姟鍐呭

- 鍦?`ADM-011` 宸茶ˉ榻愨€滅鐢ㄥ嵆鎾ら攢 refresh + 璇锋眰鏃舵寜鐪熷疄鐢ㄦ埛鐘舵€佹嫤鎴€濈殑鍚庣杈圭晫鍩虹涓婏紝缁х画鏀舵帀鍓嶇鏈€鍚庝竴娈典綋楠岀己鍙ｏ紝涓嶈杩愯涓殑琚鐢ㄨ处鍙峰彧鏀跺埌瑁?`403` 鑰屼繚鐣欐棫 session銆?- 鏈疆鐩爣涓嶆槸缁х画鎵╁悗鍙版不鐞嗛潰锛岃€屾槸娌?`API-011 / ADM-011` 鍋氫竴涓皬鑰屽畬鏁寸殑鑱斿姩鍒囩墖锛氬叡浜?API client 璇嗗埆 `403 user_disabled`銆佸墠鍚庡彴缁熶竴娓?session銆佺櫥褰曢〉鏄剧ず鏄庣‘鐨勭鐢ㄦ彁绀猴紝骞剁敤璺ㄧ娴嬭瘯閿佷綇琛屼负銆?### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts` 涓?`packages/api-client/src/index.test.ts`锛屾妸鍏变韩 `SessionInvalidationState` 鎵╁埌 `refresh_failed | session_rejected`锛屽苟璁?`createSessionRequest(...)` 鍦ㄨ姹傞樁娈电洿鎺ユ敹鍒?`403 user_disabled` 鏃朵笉瑙﹀彂 refresh锛岃€屾槸绔嬪嵆娓?session銆佽褰曠粨鏋勫寲澶辨晥鍘熷洜銆?- 鏇存柊 `frontend-user/src/api/sessionRefresh.test.ts`銆乣frontend-user/src/pages/AuthPages.tsx` 涓?`frontend-user/src/pages/AuthPages.test.tsx`锛岄攣瀹氱敤鎴风鍙椾繚鎶よ姹傚湪 `user_disabled` 鏃剁洿鎺ュ洖鍒扮櫥褰曢〉锛屽苟鏄剧ず鈥滃綋鍓嶈处鍙峰凡琚鐢紝璇疯仈绯荤鐞嗗憳鍚庨噸鏂扮櫥褰曘€傗€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃鍚庡彴鑷妇鎴栧悗缁彈淇濇姢璇锋眰鍦?`user_disabled` 鏃跺悓鏍风珛鍗虫竻绌哄悗鍙?session銆佸洖閫€鐧诲綍椤碉紝骞舵樉绀衡€滃綋鍓嶈处鍙峰凡琚鐢紝璇疯仈绯诲叾浠栫鐞嗗憳鍚庨噸鏂扮櫥褰曘€傗€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `API-011 / ADM-011` 浠庘€滃墠绔繕娌℃帴 403 user_disabled鈥濇帹杩涘埌鈥滆法绔細璇濊仈鍔ㄥ凡鏀跺彛鈥濈殑褰撳墠浜嬪疄銆?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/api-client/src/index.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npx vitest run packages/api-client/src/index.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `API-011` 鐜板湪涓嶅啀鍙鐞?refresh 澶辫触鏃剁殑琚姩鐧诲嚭锛涜姹傞樁娈电洿鎺ユ敹鍒?`403 user_disabled` 涔熶細璧扮粺涓€鐨勬竻 session 鍜岀鐢ㄦ彁绀鸿涔夛紝鍚庣画鏂板彈淇濇姢璇锋眰杈圭晫涓嶉渶瑕佸啀鍚勮嚜琛ヤ竴濂楀眬閮ㄥ鐞嗐€?- 褰撳墠鍏变韩浼氳瘽灞備粛鏈繘鍏?HttpOnly Refresh Token 杩佺Щ璇存槑銆佹洿澶氬悗鍙版ā鍧?API client 鎷嗗垎涓庢洿缁嗙矑搴︾殑澶辨晥鍒嗙被锛涘悗缁洿閫傚悎缁х画娌?`API-011 / ADM-010 / ADM-011` 鏀跺彛锛岃€屼笉鏄洖鍒伴〉闈㈤噷鏁ｈ惤鏂扮殑浼氳瘽 helper銆?
## 2026-07-09 12:05:00 +08:00 | v1.1.0-alpha.149 | 鎺ㄨ繘 ADM-011 AI 浠诲姟娌荤悊鍔ㄤ綔璧锋
### 浠诲姟鍐呭

- 缁х画娌?`ADM-011` 鍋氣€滃厛鎶婂悗鍙版不鐞嗕富璺緞琛ラ綈鈥濈殑灏忔鎺ㄨ繘锛岃繖涓€杞粠璧勬枡娌荤悊缁х画鎵╁埌 AI 浠诲姟娌荤悊锛屼笉鍥炲ご娣辨寲宸叉湁涓炬姤/璧勬枡瀛愬煙銆?- 鏈疆鐩爣鏄妸 AI 浠诲姟鍒楄〃浠庡彧璇绘帹杩涘埌鏈€灏忓彲鎵ц娌荤悊锛氬け璐ヤ换鍔″彲閲嶈瘯锛屽緟澶勭悊浠诲姟鍙彇娑堬紝骞朵繚鐣欏悗鍙板彲杩芥函瀹¤璁板綍銆?
### 瀹為檯鍙樻洿

- 鏂板 `backend/internal/modules/admin/service/ai_task_actions_test.go`锛屽厛鐢?RED 閿佸畾涓変釜缂哄彛锛歚HandleAITask(...)` 灏氫笉瀛樺湪銆丄I 浠诲姟杩樻病鏈?`retry / cancel` 鐘舵€佸姩浣溿€佸悗鍙颁篃杩樹笉浼氫负杩欎簺鍔ㄤ綔鍐欏叆瀹¤鏃ュ織銆?- 鏇存柊 `backend/internal/modules/admin/service/service.go`銆乣handler/handler.go` 涓?`router/router.go`锛岃ˉ榻?`HandleAITask(...)`銆乣/api/v1/admin/ai/tasks/:id/retry` 涓?`/api/v1/admin/ai/tasks/:id/cancel`锛涘綋鍓嶅師鍨嬭涔夋槸 `failed -> pending`銆乣pending -> cancelled`锛屽苟鍦ㄥ悓涓€浜嬪姟鍐呭啓鍏?`admin.handle.ai_task` 瀹¤浜嬩欢銆?- 鏇存柊 `backend/internal/modules/admin/dto/governance.go`锛屼负鍚庡彴 AI 浠诲姟娌荤悊鍒楄〃琛ュ洖 `errorMessage` 涓?`updatedAt` 瀛楁锛岃澶辫触鍘熷洜鍜屾渶杩戞洿鏂版椂闂磋兘鐩存帴鏄剧ず鍦ㄦ不鐞嗚鍥鹃噷銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛岃 AI 妯″潡鍦ㄥけ璐ヤ换鍔′笂鏄剧ず鈥滈噸璇曚换鍔♀€濓紝鍦ㄥ緟澶勭悊浠诲姟涓婃樉绀衡€滃彇娑堜换鍔♀€濓紝骞堕€氳繃纭灞傛彁浜ょ湡瀹炲悗鍙板姩浣溿€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岄攣瀹?AI 浠诲姟娌荤悊椤典細鏄剧ず鍔ㄤ綔鎸夐挳銆佸厛寮圭‘璁ゅ眰锛屽啀鎻愪氦 `/api/v1/admin/ai/tasks/:id/retry`锛涘悓鏃朵繚鐣欑幇鏈夌鐞嗙浼氳瘽澶翠笌妯″潡鍔犺浇璺緞涓嶅洖閫€銆?
### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚go test ./internal/modules/admin/service`
- `go test ./internal/modules/admin/...`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- 鍚庡彴 AI 妯″潡鐜板湪宸茬粡浠庡彧璇诲垪琛ㄦ帹杩涘埌鏈€灏忓彲鎿嶄綔娌荤悊锛屽悗缁户缁ˉ鈥滅湡姝ｉ噸鎺掓墽琛?/ 鐪熷彇娑堟墽琛屽櫒 / 鏇寸粏浠诲姟澶辫触鍘熷洜涓庡璁¤鍥锯€濇椂锛屼細姣旂幇鍦ㄩ『寰堝銆?- 褰撳墠 AI 浠诲姟娌荤悊浠嶆槸鈥滅姸鎬佽縼绉荤骇鈥濆師鍨嬶紝`retry` 鍏堝洖鍒?`pending`锛宍cancel` 鍏堝啓鎴?`cancelled`锛岃繕娌℃湁瀵规帴鐪熸鐨勫紓姝ユ墽琛屽櫒閲嶆帓鎴栦腑鏂満鍒讹紱鍚庣画鑻ョ户缁帹杩?`ADM-010 / ADM-011`锛屾洿閫傚悎鎶?AI銆佽祫鏂欍€佺敤鎴蜂笌瀹¤鍔ㄤ綔缁х画寰€ page / feature 灞備笅娌夈€?
## 2026-07-09 11:50:00 +08:00 | v1.1.0-alpha.148 | 鎺ㄨ繘 ADM-011 璧勬枡娌荤悊鍒囧埌鐪熷疄鏉愭枡鍒楄〃
### 浠诲姟鍐呭

- 缁х画娌?`ADM-011` 鍋氣€滃厛鎶婂悗鍙版不鐞嗕富璺緞琛ラ綈鈥濈殑灏忔鎺ㄨ繘锛屼笉鍦ㄤ妇鎶ュ姩浣滀笂缁х画鍗曠偣娣辨寲銆?- 鏈疆鐩爣鏄妸 `materials` 妯″潡浠?`/api/v1/admin/files` 鐨勫崰浣嶅垪琛ㄦ帹杩涘埌鐪熷疄鏉愭枡娌荤悊锛氳鍙栧疄闄呰祫鏂欒褰曪紝骞跺湪娌荤悊瑙嗗浘閲岀洿鎺ユ墽琛岃祫鏂欏鏍?涓嬫灦鍔ㄤ綔銆?
### 瀹為檯鍙樻洿

- 鏂板 `backend/internal/modules/admin/service/materials_list_test.go`锛屽厛鐢?RED 閿佸畾鍚庡彴缂哄皯 `ListMaterials(...)`銆佽祫鏂欐不鐞嗛〉浠嶅湪璧版枃浠跺垪琛ㄥ崰浣嶈繖涓や釜缂哄彛銆?- 鏇存柊 `backend/internal/modules/admin/dto/governance.go`銆乣service/service.go`銆乣handler/handler.go` 涓?`router/router.go`锛岃ˉ榻?`AdminMaterialPayload`銆乣ListMaterials(...)` 浠ュ強 `/api/v1/admin/materials`锛涘悗鍙扮幇鍦ㄤ細杩斿洖璧勬枡鏍囬銆佷綔鑰呫€佸垎绫汇€侀檮浠跺悕銆佺姸鎬佸拰鏃堕棿瀛楁銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屾妸 `materials` 妯″潡鍒囧埌鐪熷疄 `/api/v1/admin/materials`锛屽苟鎸夎祫鏂欑姸鎬佹毚闇?`approve / reject / hide` 鍔ㄤ綔锛涜嫢璧勬枡褰撳墠涓?`hidden`锛屾不鐞嗚鍥鹃噷鍙洿鎺ユ墽琛屾仮澶嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岄攣瀹氳祫鏂欐不鐞嗕細鍔犺浇鐪熷疄鏉愭枡璁板綍銆佹樉绀哄姩浣滄寜閽紝骞跺湪纭鍚庢彁浜?`/api/v1/admin/moderation/materials/:id/:action`锛屼笉鍐嶅洖閫€鍒?`/api/v1/admin/files`銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-011` 浠庘€滃彧鏈変妇鎶ュ姩浣滆捣姝モ€濇帹杩涘埌鈥滀妇鎶?+ 璧勬枡娌荤悊鈥濅袱娈电湡瀹炲垏鐗囥€?
### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚go test ./internal/modules/admin/service`
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- 鍚庡彴鈥滆祫鏂欐不鐞嗏€濈幇鍦ㄥ凡缁忚劚绂绘枃浠跺崰浣嶉〉锛屽紑濮嬪叿澶囩湡瀹炴潗鏂欒褰曞拰鍙墽琛屽姩浣滐紱鍚庣画缁х画琛モ€滀笅鏋?/ 鎭㈠鈥濈殑鏇存竻鏅拌繍钀ヨ涔夈€佺嫭绔嬪璁′簨浠跺拰澶辫触鍥炴粴鏃讹紝浼氭瘮鐜板湪鏇撮『銆?- 褰撳墠璧勬枡娌荤悊鍔ㄤ綔浠嶅鐢ㄥ鏍告祦鐨?`approve / reject / hide` 璇箟锛屼笖鍔ㄤ綔鐘舵€佽繕闆嗕腑鍦?`AdminWorkspaceView.vue`锛涘悗缁嫢缁х画鎺ㄨ繘 `ADM-010 / ADM-011`锛屾洿閫傚悎鎶婅祫鏂欍€佺敤鎴枫€丄I銆佸璁＄瓑妯″潡鍔ㄤ綔缁х画寰€ page / feature 灞備笅娌夈€?
## 2026-07-09 11:36:00 +08:00 | v1.1.0-alpha.147 | 鎺ㄨ繘 ADM-011 涓炬姤娌荤悊鍔ㄤ綔涓庡璁￠摼璺捣姝?### 浠诲姟鍐呭

- 鎸夊綋鍓嶁€滃厛琛ュ叏灞€涓昏矾寰勩€佸啀娣辨寲鍗曠偣鈥濈殑鑺傚锛屽惎鍔?`ADM-011` 鐨勬渶灏忛鍒囩墖锛屼笉涓€娆℃€ч摵寮€灏佺銆佷笅鏋躲€侀噸璇曠瓑鍏ㄩ儴鍚庡彴娌荤悊鍔ㄤ綔銆?- 鏈疆鐩爣鏄妸绠＄悊绔妇鎶ュ垪琛ㄤ粠鍙鎺ㄨ繘鍒扮湡瀹炲彲鎵ц浠诲姟锛氱鐞嗗憳鍙互鏄惧紡 `resolve / dismiss` 涓炬姤锛屽苟鎶婂鐞嗕汉銆佸鐞嗘椂闂村拰瀹¤浜嬩欢鍐欒繘鍚庣閾捐矾銆?
### 瀹為檯鍙樻洿

- 鏂板 `backend/internal/modules/admin/service/report_actions_test.go`锛屽厛鐢?RED 閿佸畾涓夌被缂哄彛锛歚HandleReport(...)` 灏氫笉瀛樺湪銆侀潪娉曠姸鎬佷笉浼氳鎷掔粷銆佷妇鎶ュ鐞嗚繕涓嶄細鍚屾鍐欏叆瀹¤鏃ュ織銆?- 鏇存柊 `backend/internal/modules/admin/service/service.go`锛屾柊澧炰簨鍔″寲鐨?`HandleReport(actorID, reportID, status)`锛涘彧鎺ュ彈 `resolved / dismissed`锛屼細鍐欏洖 `reports.status`銆乣handled_by`銆乣handled_at`锛屽苟杩藉姞 `admin.handle.report` 瀹¤浜嬩欢锛沗ListReports(...)` 涔熻ˉ鍥?`handledBy`銆乣handledAt` 瀛楁銆?- 鏇存柊 `backend/internal/modules/admin/handler/handler.go` 涓?`backend/internal/modules/admin/router/router.go`锛岃ˉ榻?`/api/v1/admin/reports/:id/resolve`銆乣/api/v1/admin/reports/:id/dismiss` 涓ゆ潯娌荤悊鍔ㄤ綔鍏ュ彛锛屾部鐢ㄧ幇鏈夌鐞嗗憳韬唤涓婁笅鏂囦笌缁熶竴鍝嶅簲 envelope銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`銆乣frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`frontend-admin/src/components/admin/admin.css`锛岃涓炬姤璇︽儏鍖哄嚭鐜?`resolve / dismiss` 鍔ㄤ綔鎸夐挳锛屽苟閫氳繃纭灞傛彁浜ゅ悗鍙版不鐞嗗姩浣滐紝鍐嶅洖鍐欏垪琛ㄤ笌璇︽儏鐘舵€併€?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.test.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岄攣瀹氭不鐞嗘ā鍧楃殑鍔ㄤ綔鎸夐挳灞曠ず銆佷簨浠跺彂灏勩€佺‘璁ゅ眰鍜屾彁浜ゅ悗鐨勭姸鎬佸洖鍐欎笉鍥為€€銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-011` 浠庣函瑙勫垝鎺ㄨ繘鍒扳€滀妇鎶ユ不鐞嗗姩浣滈鍒囩墖宸茶捣姝モ€濄€?
### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service`
- RED锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚go test ./internal/modules/admin/service`
- `go test ./internal/modules/admin/...`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- `ADM-011` 鐜板湪宸茬粡浠庘€滃悗鍙版不鐞嗗叏鏄彧璇诲垪琛ㄢ€濇帹杩涘埌鈥滀妇鎶ュ鐞嗗叿澶囩湡瀹炲姩浣滀笌瀹¤閾捐矾鈥濓紝鍚庣画缁х画琛ヨ祫鏂欎笅鏋?鎭㈠銆丄I 浠诲姟閲嶈瘯/鍙栨秷銆佹ā鏉垮鏍?鍙戝竷鏃讹紝鍙互娌垮悓涓€濂楃‘璁ゆ祦鍜屽璁¤涔夋墿灞曘€?- 褰撳墠鍚庡彴娌荤悊鍔ㄤ綔鐘舵€佷粛涓昏鐢?`AdminWorkspaceView.vue` 鍗忚皟锛涘悗缁嫢缁х画鎺ㄨ繘 `ADM-010 / ADM-011`锛屾洿閫傚悎鎶?users / materials / ai / audit 鐨勫姩浣滆竟鐣屻€佺‘璁ょ姸鎬佸拰澶辫触澶勭悊涓€璧蜂笅娌夊埌妯″潡椤垫垨 feature 灞傘€?
## 2026-07-09 10:18:44 +08:00 | v1.1.0-alpha.142 | 鎺ㄨ繘 FE-041 鍏变韩 ConfirmDialog 鎵╁睍鍒板浘璋卞伐浣滃尯涓昏矾寰?### 浠诲姟鍐呭

- 缁х画娌?`FE-041` 鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鎵╁睍锛屼笉鍥炲埌鍥捐氨鎺у埗鍣ㄧ殑鏇存繁閲嶆瀯锛屼篃涓嶆柊寮€鍚庡彴娌荤悊鍒嗘敮銆?- 鏈疆鐩爣鏄妸鍥捐氨宸ヤ綔鍖洪噷浠呭墿鐨勪袱澶勯珮棰戝師鐢熺‘璁ゆ敹鍙ｅ埌鍏变韩 `ConfirmDialog`锛氫竴澶勬槸鍐茬獊澶勭悊涓殑鈥滄斁寮冩湰鍦板苟閲嶈浇鏈€鏂板浘璋扁€濓紝鍙︿竴澶勬槸姒傝闈㈡澘閲岀殑鈥滃垹闄ゅ綋鍓嶅浘璋扁€濄€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛屽厛鐢?RED 閿佸畾鍥捐氨宸ヤ綔鍖虹殑涓や釜鐩爣璺緞涓嶅啀鐩存帴渚濊禆鍘熺敓 `window.confirm(...)`锛岃€屾槸鍏堝嚭鐜板叡浜‘璁ゆ锛屽啀鐢辩敤鎴锋槑纭偣鍑荤‘璁ょ户缁墽琛岄噸杞芥垨鍒犻櫎銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧炲浘璋卞伐浣滃尯绾у埆鐨勫叡浜‘璁ゆ鐘舵€侊紝缁熶竴鎵挎帴 `reload-latest` 涓?`delete-graph` 涓ょ被 destructive action锛屽苟淇濈暀 `danger` 鍔ㄤ綔銆佺‘璁や腑绂佺敤鍜屽け璐ユ彁绀恒€?- `GraphConflictAssistCard` 鐨勨€滄斁寮冩湰鍦板苟閲嶈浇鏈€鏂板浘璋扁€濅互鍙?`GraphWorkspaceOverviewPanel` 鐨勨€滃垹闄ゅ綋鍓嶅浘璋扁€濈幇鍦ㄩ兘浼氬厛寮瑰嚭鍏变韩 `ConfirmDialog`锛屽啀杩涘叆鍘熸湁鐨勯噸杞芥垨鍒犻櫎涓氬姟娴併€?- 杩欎竴杞畬鎴愬悗锛宍frontend-user`銆乣frontend-admin` 涓?`packages` 鑼冨洿鍐呯殑鍘熺敓 `window.confirm` 璋冪敤宸叉竻闆讹紝璇存槑鐢ㄦ埛绔富璺緞鐨勭‘璁や氦浜掔涓€闃舵宸茬粡浠庢祻瑙堝櫒鍘熺敓瀹炵幇缁熶竴鏀跺彛鍒板叡浜‘璁ゆ銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?ConfirmDialog 宸蹭粠绗旇椤垫墿灞曞埌鍥捐氨宸ヤ綔鍖轰富璺緞鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `rg -n "window\\.confirm" frontend-user frontend-admin packages`

### 鍚庣画褰卞搷

- `ConfirmDialog` 鐜板湪宸茬粡浠庡崟椤靛垹闄ょ‘璁ゆ墿灞曞埌鍥捐氨宸ヤ綔鍖轰富璺緞锛屽悗缁户缁帹杩涘悗鍙版不鐞嗛噷鐨勫垹闄ゃ€佷笅鏋躲€侀噸璇曠瓑纭鍔ㄤ綔鏃讹紝鍙互娌垮悓涓€濂?destructive action 璇箟缁х画鏀跺彛銆?- 褰撳墠鍥捐氨宸ヤ綔鍖虹殑纭妗嗙姸鎬佷粛鐒剁敱 `useGraphWorkspaceController.tsx` 鐩存帴缁存姢锛涘悗缁鏋滄部 `GPH-040` 鎷?commands / store锛屾洿閫傚悎鎶婅繖绫?destructive intent 鍜屽璇濇鐘舵€佷竴璧锋矇鍒版洿娓呮櫚鐨勮竟鐣屽眰銆?
## 2026-07-09 10:07:41 +08:00 | v1.1.0-alpha.141 | 鎺ㄨ繘 FE-041 鍏变韩 ConfirmDialog 鎺ュ叆绗旇鍒犻櫎纭
### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍋忕鍏变韩 UI 涓荤嚎锛屼篃涓嶅洖鍒板浘璋辨帶鍒跺櫒閲屼竴娆℃€ф敼寰堝纭璺緞銆?- 鏈疆鐩爣鏄妸宸茬粡鍑虹幇鍦ㄧ湡瀹炲涔犺矾寰勯噷鐨勫垹闄ょ‘璁わ紝浠庢祻瑙堝櫒鍘熺敓 `window.confirm(...)` 鏀跺彛涓哄叡浜?`ConfirmDialog`锛屽悓鏃朵繚鐣欑鐢ㄤ腑銆侀敊璇彁绀哄拰宸ヤ綔鍖虹姸鎬佹秷鎭紝涓嶆妸杩欎竴姝ユ墿鏁ｆ垚鏁村妯℃€佺郴缁熼噸鍐欍€?
### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/ConfirmDialog.tsx`锛岃ˉ榻愬叡浜?`ConfirmDialog` primitive锛屽厛缁熶竴纭鏍囬銆佽鏄庢枃妗堛€佸彇娑?纭鍔ㄤ綔銆乣danger` 鍙樹綋锛屼互鍙婄‘璁や腑绂佺敤鍜岄敊璇彁绀鸿繖缁勬渶灏忕‘璁や氦浜掑绾︺€?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/ConfirmDialog.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/pages/NotesPage.tsx`锛屾妸绗旇鍒犻櫎浠庢祻瑙堝櫒鍘熺敓 `window.confirm(...)` 鏀逛负鍏变韩 `ConfirmDialog`锛涘垹闄や腑鐨勭鐢ㄦ€併€佸け璐ユ彁绀哄拰椤堕儴宸ヤ綔鍖烘秷鎭繚鎸佸彲瑙併€?- 鏇存柊 `frontend-user/src/styles/ui-redesign.css`锛岃ˉ榻?`ConfirmDialog` 鐨勯伄缃┿€侀潰鏉裤€侀敊璇€佸拰搴曢儴鍔ㄤ綔鍖烘牱寮忥紝璁╁叡浜?primitive 鍦ㄧ湡瀹為〉闈㈤噷鏈夌ǔ瀹氱殑瑙嗚楠ㄦ灦銆?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx`銆佹柊澧?`frontend-user/src/design-system/primitives/ConfirmDialog.test.tsx` 涓庨噸鍐?`frontend-user/src/pages/NotesPage.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滃叡浜?ConfirmDialog 缂哄け / 鍏煎鍑哄彛缂哄け / NotesPage 浠嶇洿鎺ヤ緷璧栧師鐢熺‘璁ゆ鈥濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆佺‘璁や腑绂佺敤鎬併€佸吋瀹瑰嚭鍙ｄ笌鍒犻櫎纭鎺ョ嚎涓嶅洖閫€銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?ConfirmDialog 宸茶惤鍦板苟鎺ュ叆绗旇鍒犻櫎纭鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/ConfirmDialog.test.tsx src/pages/NotesPage.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/ConfirmDialog.test.tsx src/pages/NotesPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧鎵挎帴椤甸潰鐘舵€併€佽〃鍗曞拰楠ㄦ灦锛屼篃寮€濮嬫壙鎺?destructive action 鐨勭‘璁よ涔夛紱鍚庣画缁х画鎺ㄨ繘鍥捐氨鍒犻櫎銆侀噸杞芥斁寮冩垨鍚庡彴娌荤悊鍔ㄤ綔鏃讹紝鍙互娌跨潃鍚屼竴濂楃‘璁ら鏋剁户缁敹鍙ｃ€?- 褰撳墠杩欒疆鍏堝彧瑕嗙洊 `NotesPage` 鐨勫垹闄ょ‘璁わ紱鍥捐氨宸ヤ綔鍖洪噷鐨勨€滈噸杞芥渶鏂板浘璋?/ 鍒犻櫎鍥捐氨鈥濅粛鍦ㄦ帶鍒跺櫒閲岀洿鎺ヨ皟鐢ㄥ師鐢熺‘璁ゆ锛屽悗缁洿閫傚悎鎸夌湡瀹為珮棰戣矾寰勯€愭鏇挎崲锛岃€屼笉鏄竴娆℃€цЕ纰版暣涓帶鍒跺櫒銆?
## 2026-07-09 09:47:29 +08:00 | v1.1.0-alpha.140 | 鎺ㄨ繘 FE-041 鍏变韩 CommandBar 鎺ュ叆涓荤珯椤堕儴楠ㄦ灦
### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍋忕鍏变韩 UI 涓荤嚎锛屼篃涓嶅洖鍒板崟涓€鍐茬獊鍦烘櫙娣辨寲銆?- 鏈疆鐩爣鏄妸涓荤珯澹冲眰閲岄噸澶嶅嚭鐜扮殑椤堕儴 meta / 鎼滅储 / 鍔ㄤ綔楠ㄦ灦鎶芥垚鍏变韩 `CommandBar`锛屽悓鏃朵繚鐣欑幇鏈夐〉闈㈠厓淇℃伅銆佸叏灞€鎼滅储銆丄I 鑽夌鍏ュ彛鍜岄€€鍑虹櫥褰曢€昏緫涓嶅彉锛岃€屼笉鏄洿鎺ラ噸鍐?`AppShell` 鐨勮涓恒€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/CommandBar.tsx`锛岃ˉ榻愬叡浜?`CommandBar` primitive锛屽厛缁熶竴 `topbar`銆乥readcrumb銆乻ubtitle銆佹悳绱㈡Ы浣嶅拰鍔ㄤ綔妲戒綅杩欑粍椤堕儴楠ㄦ灦璇箟銆?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/CommandBar.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/app/chrome/CommandBar.tsx`锛屾妸鐜版湁涓荤珯椤堕儴鏉℃敼涓衡€滈〉闈㈠厓淇℃伅/鎼滅储/鐢ㄦ埛鍔ㄤ綔鍖呰鍣?+ 鍏变韩楠ㄦ灦鈥濅袱灞傜粨鏋勶紱鐜版湁鎼滅储鎻愪氦娴佺▼銆丄I 鑽夌鍏ュ彛銆佽缃叆鍙ｅ拰閫€鍑虹櫥褰曢€昏緫淇濇寔涓嶅彉銆?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx` 涓庢柊澧?`frontend-user/src/design-system/primitives/CommandBar.test.tsx`銆乣frontend-user/src/app/chrome/CommandBar.test.tsx`锛屽苟澶嶇敤 `frontend-user/src/app/layouts/AppShell.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滃叡浜?CommandBar 缂哄け / 鍏煎鍑哄彛缂哄け / 涓荤珯椤堕儴鏉′粛鏈蛋鍏变韩瀹炵幇鈥濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆佸寘瑁呮帴绾夸笌澹冲眰鎼滅储鍏ュ彛涓嶅洖閫€銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?CommandBar 宸茶惤鍦板苟鎺ュ叆涓荤珯椤堕儴楠ㄦ灦鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/CommandBar.test.tsx src/app/chrome/CommandBar.test.tsx src/app/layouts/AppShell.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/CommandBar.test.tsx src/app/chrome/CommandBar.test.tsx src/app/layouts/AppShell.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧瑕嗙洊鐘舵€併€佹娊灞夈€佹鏌ュ櫒銆佹寜閽€佽〃鍗曚笌椤甸潰澶撮儴锛屼篃寮€濮嬫壙鎺ヤ富绔欓《閮ㄩ鏋讹紱鍚庣画缁х画鎺ㄨ繘 `ConfirmDialog` 鎴栧悗鍙扮瓫閫夋潯鏃讹紝椤甸潰楠ㄦ灦灞傜殑鍏变韩璺緞浼氭洿椤恒€?- 褰撳墠杩欒疆涓昏瑕嗙洊鐨勬槸涓荤珯 `AppShell` 椤堕儴鏉★紱鍥捐氨宸ヤ綔鍖洪噷鐨勪笓鐢?command bar 浠嶆槸鍙︿竴濂楀伐鍏锋爮璇箟锛屽悗缁槸鍚︾户缁叡鐢ㄩ渶瑕佺粨鍚堥偅濂楁搷浣滄潯鐨勪笓鐢ㄧ▼搴﹀啀鍒ゆ柇銆?
## 2026-07-09 09:38:52 +08:00 | v1.1.0-alpha.139 | 鎺ㄨ繘 FE-041 鍏变韩 PageHeader 鎺ュ叆宸ヤ綔鍖哄ご閮?### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍋忕鍏变韩 UI 涓荤嚎锛屼篃涓嶅洖鍒板崟涓€鍐茬獊鍦烘櫙娣辨寲銆?- 鏈疆鐩爣鏄妸宸茬粡琚涓〉闈㈠鐢ㄧ殑宸ヤ綔鍖哄ご閮ㄧ粨鏋勬娊鎴愬叡浜?`PageHeader`锛屽苟浼樺厛閫氳繃 `WorkspaceHeader` 杩欎釜鐜版湁鍏ュ彛鎶婁竴鎵圭湡瀹為〉闈竴璧锋帴鍒板叡浜绾︼紝鑰屼笉鏄€愰〉閲嶅啓澶撮儴甯冨眬銆?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/PageHeader.tsx`锛岃ˉ榻愬叡浜?`PageHeader` primitive锛屽厛缁熶竴 `workspace-header`銆乣eyebrow`銆乣header-copy` 涓?`header-actions` 杩欑粍椤甸潰澶撮儴楠ㄦ灦璇箟銆?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/PageHeader.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/app/appShared.tsx`锛屾妸 `WorkspaceHeader` 鏀逛负鐩存帴澶嶇敤鍏变韩 `PageHeader`锛岃褰撳墠鎵€鏈夎蛋杩欏眰鍖呰鐨勭湡瀹為〉闈竴璧疯繘鍏ュ悓涓€濂楀ご閮ㄥ绾︺€?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx` 涓庢柊澧?`frontend-user/src/design-system/primitives/PageHeader.test.tsx`銆乣frontend-user/src/app/appShared.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滃叡浜?PageHeader 缂哄け / 鍏煎鍑哄彛缂哄け / WorkspaceHeader 浠嶆湭璧板叡浜疄鐜扳€濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆佸ご閮ㄥ姩浣滃尯鍜屽寘瑁呮帴绾裤€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?PageHeader 宸茶惤鍦板苟鎺ュ叆宸ヤ綔鍖哄ご閮ㄢ€濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/PageHeader.test.tsx src/app/appShared.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/PageHeader.test.tsx src/app/appShared.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧瑕嗙洊鐘舵€併€佹娊灞夈€佹鏌ュ櫒銆佹寜閽€佹爣绛惧拰琛ㄥ崟杈撳叆锛屼篃寮€濮嬫壙鎺ラ〉闈㈠ご閮ㄩ鏋讹紱鍚庣画缁х画鎺ㄨ繘 `CommandBar` 鏃讹紝椤甸潰楠ㄦ灦灞傜殑鍏变韩璺緞浼氭洿椤恒€?- 褰撳墠杩欒疆涓昏閫氳繃 `WorkspaceHeader` 瑕嗙洊浜嗕富宸ヤ綔鍖洪〉闈紱鎼滅储宸ヤ綔鍖哄拰鍥捐氨宸ヤ綔鍖轰粛淇濈暀鍚勮嚜鐩存帴鍐欑殑 `workspace-header` / 鎼滅储鏉＄粨鏋勶紝涓嬩竴姝ユ洿鍊煎緱缁х画娌胯繖浜涢噸澶嶇偣鎺ㄨ繘銆?
## 2026-07-09 09:32:26 +08:00 | v1.1.0-alpha.138 | 鎺ㄨ繘 FE-041 鍏变韩 Select 鎺ュ叆绗旇涓庨槄璇昏〃鍗?### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍋忕鍏变韩 UI 涓荤嚎锛屼篃涓嶅洖鍒板崟涓€鍐茬獊鍦烘櫙娣辨寲銆?- 鏈疆鐩爣鏄妸绗旇鍜岄槄璇讳富璺緞閲屽凡缁忛噸澶嶅嚭鐜扮殑璧勬枡鏉ユ簮 / 鍐欏叆 deck 閫夋嫨鍣ㄦ娊鎴愬叡浜?`Select`锛屽苟鑷冲皯鎺ュ埌涓ゆ潯鐪熷疄瀛︿範璺緞椤甸潰锛岃€屼笉鏄彧鍋滅暀鍦ㄥ寘閲屸€滄柊澧炰竴涓笅鎷夌粍浠舵枃浠垛€濄€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/Select.tsx`锛岃ˉ榻愬叡浜?`Select` primitive锛屽厛缁熶竴 `ds-select` class 涓?`invalid` 閿欒鎬佽涔夈€?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/Select.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/pages/NotesPage.tsx` 涓?`frontend-user/src/pages/ReaderPage.tsx`锛屾妸璧勬枡鏉ユ簮鍜屽啓鍏?Deck 閫夋嫨鍣ㄥ垏鍒板叡浜?`Select`锛岃 `FE-041` 浠庤緭鍏ユ缁х画鎵╁睍鍒伴珮棰戜笅鎷夎〃鍗曡緭鍏ャ€?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx` 涓庢柊澧?`frontend-user/src/design-system/primitives/Select.test.tsx`銆乣frontend-user/src/pages/NotesPage.test.tsx` 鍥炲綊锛屽厛鐢?RED 閿佸畾鈥滃叡浜?Select 缂哄け / 鍏煎鍑哄彛缂哄け / 椤甸潰浠嶆槸瑁?select鈥濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆侀敊璇€佽涔変笌涓昏矾寰勬帴绾裤€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Select 宸茶惤鍦板苟鎺ュ叆绗旇涓庨槄璇昏〃鍗曗€濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/Select.test.tsx src/pages/NotesPage.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/Select.test.tsx src/pages/NotesPage.test.tsx src/pages/ReaderPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧瑕嗙洊鐘舵€併€佹娊灞夈€佹鏌ュ櫒銆佹寜閽€佹爣绛惧拰杈撳叆妗嗭紝涔熷紑濮嬫壙鎺ョ湡瀹炲涔犺矾寰勯噷鐨勪笅鎷夐€夋嫨锛涘悗缁户缁帹杩?`CommandBar`銆乣PageHeader` 鎴栫鐞嗙绛涢€夊櫒鏃朵細鏇撮『銆?- 褰撳墠杩欒疆浠嶅彧瑕嗙洊 React 鐢ㄦ埛绔紱绠＄悊绔笌 AI 椤甸潰銆佸浘璋卞伐浣滃尯涓殑 `select-field` 瑙嗚鍙樹綋杩樻病鐩存帴鎺ュ埌杩欏眰鍏变韩 `Select`锛屼笅涓€姝ユ洿鍊煎緱缁х画娌块珮棰戠瓫閫変笌椤甸潰楠ㄦ灦閲嶅鐐规帹杩涖€?
## 2026-07-09 09:25:25 +08:00 | v1.1.0-alpha.137 | 鎺ㄨ繘 FE-041 鍏变韩 Input 鎺ュ叆璧勬枡椤佃〃鍗?### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍋忕鍏变韩 UI 涓荤嚎锛屼篃涓嶅洖鍒板崟涓€鍐茬獊鍦烘櫙娣辨寲銆?- 鏈疆鐩爣鏄妸璧勬枡椤靛凡缁忛噸澶嶅嚭鐜扮殑鎼滅储杈撳叆涓庣紪杈戣〃鍗曡緭鍏ユ娊鎴愬叡浜?`Input`锛屽苟鑷冲皯鎺ュ埌涓€鏉＄湡瀹炲涔犺矾寰勯〉闈紝鑰屼笉鏄彧鍋滅暀鍦ㄥ寘閲屸€滄柊澧炰竴涓緭鍏ョ粍浠舵枃浠垛€濄€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/Input.tsx`锛岃ˉ榻愬叡浜?`Input` primitive锛屽厛缁熶竴榛樿 `type="text"`銆乣ds-input` class 涓?`invalid` 閿欒鎬佽涔夈€?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/Input.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/pages/MaterialsPage.tsx`锛屾妸璧勬枡鎼滅储妗嗗拰璧勬枡璇︽儏缂栬緫琛ㄥ崟鍒囧埌鍏变韩 `Input`锛岃 `FE-041` 浠庢寜閽€佹爣绛剧户缁墿灞曞埌楂橀琛ㄥ崟杈撳叆銆?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx` 涓庢柊澧?`frontend-user/src/design-system/primitives/Input.test.tsx`銆乣frontend-user/src/pages/MaterialsPage.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滃叡浜?Input 缂哄け / 鍏煎鍑哄彛缂哄け鈥濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆侀粯璁よ緭鍏ョ被鍨嬨€侀敊璇€佽涔変笌璧勬枡椤垫悳绱㈡帴绾裤€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Input 宸茶惤鍦板苟鎺ュ叆璧勬枡椤佃〃鍗曗€濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/Input.test.tsx src/pages/MaterialsPage.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/Input.test.tsx src/pages/MaterialsPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧瑕嗙洊鐘舵€併€佹娊灞夈€佹鏌ュ櫒銆佹寜閽拰鏍囩锛屼篃寮€濮嬫壙鎺ョ湡瀹炲涔犺矾寰勯噷鐨勯珮棰戣緭鍏ワ紱鍚庣画缁х画鎺ㄨ繘 `Select`銆乣CommandBar`銆乣PageHeader` 鏃朵細鏇撮『銆?- 褰撳墠杩欒疆浠嶅彧瑕嗙洊 React 鐢ㄦ埛绔紱绠＄悊绔皻鏈洿鎺ユ秷璐硅繖灞?`Input`锛屼笅涓€姝ユ洿鍊煎緱缁х画娌胯祫鏂欍€佺瑪璁般€佹悳绱㈠拰鍚庡彴娌荤悊椤甸噷閲嶅鏈€鏄庢樉鐨勮緭鍏?绛涢€夐鏋剁户缁敹鍙ｃ€?
## 2026-07-09 09:14:18 +08:00 | v1.1.0-alpha.136 | 鎺ㄨ繘 FE-041 鍏变韩 Tag 鎺ュ叆闃呰涓庤祫鏂欓〉
### 浠诲姟鍐呭

- 娌垮綋鍓嶆洿楂樹紭鍏堢骇鐨?`FE-041` 缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫叡浜?primitive 鏀跺彛锛屼笉鍥炲埌鍗曚竴鍐茬獊瀛愬満鏅繁鎸栥€?- 鏈疆鐩爣鏄妸鏈€杞婚噺銆侀噸澶嶆渶鏄庢樉鐨?`chip/tag` 璇箟浠庨〉闈㈠眰鎶芥垚鍏变韩 `Tag`锛屽苟鑷冲皯鎺ュ埌闃呰鍜岃祫鏂欎袱鏉＄湡瀹炲涔犺矾寰勯〉闈紝鑰屼笉鏄彧鍋滅暀鍦ㄥ寘閲屸€滄柊澧炰竴涓粍浠舵枃浠垛€濄€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/Tag.tsx`锛岃ˉ榻愬叡浜?`Tag` primitive锛屽厛缁熶竴 `chip` / `muted` 涓ょ鍩虹璇箟銆?- 鏇存柊 `packages/ui/src/index.ts`銆乣frontend-user/src/design-system/primitives/Tag.tsx` 涓?`frontend-user/src/design-system/primitives/index.ts`锛岃ˉ榻愬叡浜鍑哄拰鐢ㄦ埛绔吋瀹瑰嚭鍙ｏ紝璁╅〉闈㈠眰缁х画娌挎湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/pages/ReaderPage.tsx` 涓?`frontend-user/src/pages/MaterialsPage.tsx`锛屾妸闃呰鍏冧俊鎭?chips 鍜岃祫鏂欒鎯呮爣绛惧垏鍒板叡浜?`Tag`锛岃 `FE-041` 浠庡浘璋遍鏋剁户缁墿灞曞埌瀛︿範涓昏矾寰勯〉闈€?- 鏇存柊 `packages/ui/src/reactPrimitives.test.tsx` 涓庢柊澧?`frontend-user/src/design-system/primitives/Tag.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滃叡浜?Tag 缂哄け / 鍏煎鍑哄彛缂哄け鈥濈殑缂哄彛锛屽啀鐢?GREEN 閿佸畾鍏变韩瀵煎嚭銆乣muted` 鍙樹綋涓庣敤鎴风鍏煎鍑哄彛銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃叡浜?Tag 宸茶惤鍦板苟鎺ュ叆鐪熷疄椤甸潰鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx frontend-user/src/design-system/primitives/Tag.test.tsx`
- `npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪涓嶅啀鍙叡浜〉闈㈢姸鎬併€佹娊灞夈€佹鏌ュ櫒鍜屾寜閽紝`Tag` 涔熷凡缁忚繘鍏ョ湡瀹炲涔犻〉闈紝涓哄悗缁户缁粺涓€琛ㄥ崟銆侀〉闈㈠ご閮ㄥ拰纭浜や簰鎻愪緵浜嗘洿绋崇殑璺緞銆?- 褰撳墠杩欒疆浠嶅彧瑕嗙洊 React 鐢ㄦ埛绔紱绠＄悊绔皻鏈洿鎺ユ秷璐硅繖灞?`Tag`锛屼笅涓€姝ユ洿鍊煎緱缁х画鎺ㄨ繘鐨勬槸 Input銆丼elect銆丆onfirmDialog銆丆ommandBar銆丳ageHeader 杩欑被鏇撮珮棰戜笖鏇磋兘鏀跺彛椤甸潰楠ㄦ灦鍒嗗弶鐨?primitives銆?
## 2026-07-09 09:06:40 +08:00 | v1.1.0-alpha.135 | 鏀跺彛 WB-032 鑺傜偣绾ф潵婧愪笌灏哄鍐茬獊椤甸潰绾у洖褰?### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫啿绐佸鐞嗘敹鍙ｏ紝涓嶆墿鏂伴€昏緫锛屽彧鎶婂凡缁忓瓨鍦ㄤ簬 helper 灞傜殑鑺傜偣绾ч樆鏂缓璁ˉ鍒伴〉闈㈢骇鐪熷疄鎿嶄綔鍥炲綊閲屻€?- 鏈疆閲嶇偣鏄妸 `invalid_source_target` 涓?`invalid_node_size` 涓ゆ潯璺緞鎺ヨ繘 `GraphWorkspaceConflictResolutionDependencies`锛氱敤鎴峰厛璇€夆€滀繚鐣欐湰鍦扳€濓紝闅忓悗鐪嬪埌闃绘柇涓庤仈鍔ㄢ€滀繚鐣欐湇鍔＄鈥濆缓璁紝骞惰兘鍦ㄨВ闄ら樆鏂悗缁х画搴旂敤宸叉爣璁板彇鑸嶃€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屾柊澧炰袱鏉￠〉闈㈢骇鍥炲綊锛屽垎鍒鐩栤€滄潵婧愪俊鎭笉瀹屾暣鑺傜偣鈥濆拰鈥滃昂瀵搁潪娉曡妭鐐光€濈殑鍐茬獊杈呭姪浜や簰銆?- 涓ゆ潯鏂板洖褰掗兘閿佸畾鍚屼竴鏉＄湡瀹炴搷浣滈摼锛歚淇濆瓨淇敼` 瑙﹀彂 `graph_version_conflict`銆佽繘鍏?`鍥捐氨鍐茬獊杈呭姪`銆佸厛鏍囪 `淇濈暀鏈湴`銆佸嚭鐜?`鍙栬垗渚濊禆鏍￠獙闂` 涓?`鑱斿姩鍙栬垗寤鸿`銆佸啀閫氳繃 `鑱斿姩淇濈暀鏈嶅姟绔痐 娓呴櫎闃绘柇骞堕噸鏂板厑璁?`搴旂敤宸叉爣璁板彇鑸嶅埌褰撳墠鑽夌`銆?- 鍚屾鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滆妭鐐圭骇鏉ユ簮/灏哄闃绘柇涔熸湁椤甸潰绾х湡瀹炴搷浣滃洖褰掆€濄€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
### 鍚庣画褰卞搷

- `WB-032` 鐨勯〉闈㈢骇鍐茬獊鐭╅樀鐜板湪涓嶅彧瑕嗙洊 dangling edge銆乴atest-head 鍒犻櫎璇箟鍜屽鐩爣杩炵嚎锛屼篃寮€濮嬮攣瀹氳妭鐐圭骇缁撴瀯閿欒鍦ㄧ湡瀹炲啿绐佸崱鐗囬噷鐨勯樆鏂笌鑱斿姩淇璺緞銆?- 褰撳墠浠嶆湭鏂板鏂扮殑鍐茬獊澶勭悊閫昏緫锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿澶氳妭鐐?杈?鍒嗙粍闃绘柇绫诲瀷鐨勯〉闈㈢骇鐪熷疄璺緞锛屾垨缁х画娌?`WB-034` 鎶婅繖浜涜矾寰勫苟鍏ユ洿鎴愪綋绯荤殑楠岃瘉鐭╅樀銆?
## 2026-07-09 07:47:00 +08:00 | v1.1.0-alpha.134 | 鏀跺彛鍥捐氨鍐茬獊 E2E 鐨勭獎灞?smoke
### 浠诲姟鍐呭

- 寤剁画 `verify:graph-conflicts` 鐨勫浐瀹氬叆鍙ｅ缓璁撅紝缁х画娌?`WB-032/WB-034` 鍋氫竴涓渶灏忎絾鏇村畬鏁寸殑楠岃瘉鏀跺彛銆?- 鏈疆鐩爣浠嶇劧涓嶆敼鍥捐氨涓氬姟閫昏緫锛屽彧鎶婂浘璋卞伐浣滃尯 Playwright 鍥炲綊浠庘€滄闈?smoke + 鐪熷疄鐗堟湰鍐茬獊璺緞鈥濈户缁帹杩涘埌鈥滅獎灞忓竷灞€涓嬩篃鑳借蛋閫氬啿绐佸鐞嗗熀鏈摼璺€濓紝瀵瑰簲鏀跺彛 backlog 涓槑纭啓鐫€鐨勨€滄闈笌绐勫睆鑷冲皯鏈?smoke 鍥炲綊鈥濄€?### 瀹為檯鍙樻洿

- 鏇存柊 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾缂哄彛锛氬綋鍓?`e2e/v1-graph-workspace.spec.ts` 杩樻病鏈変换浣?`setViewportSize(...)` 绾у埆鐨勭獎灞忚瘉鎹紝鍥捐氨鍐茬獊鍥炲綊鏂囨。閲屼篃杩樺仠鐣欏湪鈥滄闈?/ 绐勫睆鍙屽竷灞€鍐茬獊鍥炲綊浠嶇己鈥濄€?- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧炵獎灞忓浘璋卞伐浣滃尯鐗堟湰鍐茬獊 smoke锛氬湪 `390x844` 瑙嗗彛涓嬫瀯閫?`409 graph_version_conflict`锛屾柇瑷€璧勬簮/妫€鏌ュ櫒鍏ュ彛鍙銆乣鍥捐氨鍐茬獊杈呭姪` 涓?`鏀惧純鏈湴骞堕噸杞芥渶鏂板浘璋盽 浠嶅彲杈撅紝骞跺湪纭鍚庢垚鍔熷洖鍒版湇鍔＄鏈€鏂?head銆?- 鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶婂浘璋卞伐浣滃尯 E2E 鎻忚堪鎺ㄨ繘鍒扳€滄闈?绐勫睆 smoke + 鐪熷疄 `graph_version_conflict` 璺緞鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm run test:graph:conflicts:e2e`
- `npm run verify:graph-conflicts`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `verify:graph-conflicts` 鐜板湪宸茬粡鍏峰妗岄潰涓庣獎灞忎袱鏉″浘璋卞伐浣滃尯 smoke锛屽苟涓斾袱杈归兘鑷冲皯瑕嗙洊浜嗕竴娆＄湡瀹炵増鏈啿绐佸悗鐨勫啿绐佸鐞嗗叆鍙ｏ紝涓哄悗缁?`WB-034` 缁х画琛ユ洿瀹屾暣鐨勫竷灞€鐭╅樀鍜岀粍鍚堣矾寰勬彁渚涗簡鏇村彲淇＄殑 E2E 鍩哄骇銆?- 褰撳墠浠嶆湭瑕嗙洊鏇村畬鏁寸殑妗岄潰 / 绐勫睆鍐茬獊缁勫悎鐭╅樀锛屼互鍙?create/save/restore/export/layout/conflict/鏉冮檺鍏ㄩ摼璺紱鍚庣画浠嶅簲缁х画娌胯繖鏉″浐瀹氬叆鍙ｆ墿灞曘€?
## 2026-07-09 07:33:00 +08:00 | v1.1.0-alpha.133 | 鏀跺彛鍥捐氨鍐茬獊 E2E 鐨勭湡瀹炵増鏈啿绐佽矾寰?### 浠诲姟鍐呭

- 寤剁画 `verify:graph-conflicts` 鐨勫浐瀹氬叆鍙ｅ缓璁撅紝缁х画娌?`WB-032/WB-034` 鍋氫竴涓渶灏忎絾鏇磋创杩戠湡瀹炵敤鎴锋搷浣滅殑鍥炲綊鏀跺彛銆?- 鏈疆鐩爣鏄笉鏀瑰浘璋变笟鍔￠€昏緫锛屽彧鎶婂浘璋卞伐浣滃尯 Playwright smoke 浠庘€滃姞杞?淇濆瓨/瀵煎叆/鍘嗗彶鈥濇帹杩涘埌鈥滅湡瀹?`graph_version_conflict` 鍚庣殑鍐茬獊澶勭悊璺緞鈥濓紝璁╁浐瀹氬叆鍙ｈ嚦灏戣鐩栦竴娆＄湡瀹炵増鏈啿绐佹彁绀恒€佷汉宸ユ殏瀛樹笌閲嶈浇鏈€鏂?head 鐨勬搷浣滈摼銆?### 瀹為檯鍙樻洿

- 鏇存柊 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾缂哄彛锛氬綋鍓?`e2e/v1-graph-workspace.spec.ts` 铏藉凡鎺ュ叆鍥哄畾鍏ュ彛锛屼絾杩樻病鏈夌湡姝ｈ鐩栫増鏈啿绐佸鐞嗚矾寰勶紝鍥炲綊鐭╅樀鏂囨。閲屼篃娌℃湁鎶婅繖鏉?E2E 鎻忚堪鏄庣‘鎻愬崌鍒扳€滅増鏈啿绐佸鐞嗏€濆眰銆?- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧炲浘璋卞伐浣滃尯鐪熷疄鐗堟湰鍐茬獊 smoke锛氭瀯閫?`batch-save` 杩斿洖 `409 graph_version_conflict`銆侀殢鍚庢媺鍙栨湇鍔＄鏈€鏂?head 鐨勫満鏅紝鏂█椤甸潰浼氬睍绀?`鏌ョ湅鍐茬獊澶勭悊`銆乣鍥捐氨鍐茬獊杈呭姪`銆乣鍏堜繚鐣欐湰鍦帮紝绋嶅悗浜哄伐鍚堝苟` 涓?`鏀惧純鏈湴骞堕噸杞芥渶鏂板浘璋盽锛屽苟鍦ㄧ‘璁ゅ悗鎴愬姛鍒囧洖鏈€鏂扮増鏈殑绌洪棽鐘舵€併€?- 鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶婂浘璋卞伐浣滃尯 E2E 鐨勬弿杩颁粠娉涘寲 smoke 鎻愬崌鍒扳€滃凡瑕嗙洊鐪熷疄 `graph_version_conflict` 澶勭悊璺緞鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm run test:graph:conflicts:e2e`
- `npm run verify:graph-conflicts`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `verify:graph-conflicts` 鐜板湪涓嶄粎鑳借窇閫氬浘璋卞伐浣滃尯棰勮鐜锛岃繕鑳借鐩栦竴娆＄湡瀹炵増鏈啿绐佸悗鐨勫啿绐佸鐞嗗叆鍙ｅ拰閲嶈浇鏈€鏂?head 璺緞锛屼负鍚庣画 `WB-034` 缁х画琛ユ洿瀹屾暣鐨?Playwright 鍐茬獊鐭╅樀鎻愪緵浜嗘洿鎵庡疄鐨?E2E 鍩哄骇銆?- 褰撳墠浠嶆湭瑕嗙洊妗岄潰/绐勫睆鍙屽竷灞€涓嬬殑鍐茬獊璺緞锛屼互鍙婃洿瀹屾暣鐨?create/save/restore/export/layout/conflict/鏉冮檺鐭╅樀锛涘悗缁簲缁х画鍦ㄨ繖鏉″浐瀹氬叆鍙ｄ笂鎵╁睍锛岃€屼笉鏄噸鏂板垎鏁ｆ垚鎵嬪伐鍛戒护銆?
## 2026-07-09 07:18:00 +08:00 | v1.1.0-alpha.132 | 鏀跺彛鍥捐氨鍐茬獊鍥哄畾鍏ュ彛鐨?E2E smoke
### 浠诲姟鍐呭

- 鍦ㄤ笂涓€杞凡缁忓缓绔?`verify:graph-conflicts` 鍥哄畾鍏ュ彛鐨勫熀纭€涓婏紝缁х画鍋氫竴涓洿瀹屾暣浣嗕粛鐒跺彲鎺х殑鍏ㄥ眬鏀跺彛銆?- 鏈疆鐩爣鏄妸鐜版湁 `e2e/v1-graph-workspace.spec.ts` 涔熺撼杩涜繖鏉″浐瀹氬叆鍙ｏ紝璁╁浘璋卞啿绐佷笓椤归獙璇佷笉鍐嶅彧瑕嗙洊鍓嶇 Vitest銆佸悗绔?Go test 鍜屾枃妗ｅ悓姝ワ紝鑰屾槸鑷冲皯甯︿笂涓€鏉＄湡瀹為瑙堢幆澧冧笅鐨勫浘璋卞伐浣滃尯 smoke銆?### 瀹為檯鍙樻洿

- 鏇存柊 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾缂哄彛锛歚verify:graph-conflicts` 杩樻病鏈変覆涓婁笓闂ㄧ殑鍥捐氨宸ヤ綔鍖?E2E smoke锛屼篃娌℃湁鍦ㄥ洖褰掔煩闃垫枃妗ｄ腑鎶婅繖鏉?Playwright 瑕嗙洊鏄犲皠杩涙潵銆?- 鏇存柊 `package.json`锛屾柊澧?`test:graph:conflicts:e2e`锛屽苟璁?`verify:graph-conflicts` 椤哄簭鎵ц鍓嶇鍐茬獊鍥炲綊銆佸悗绔?graph 鐢熷懡鍛ㄦ湡娴嬭瘯銆佸浘璋卞伐浣滃尯 Playwright smoke 涓庢枃妗ｅ悓姝ャ€?- 鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶?`e2e/v1-graph-workspace.spec.ts` 绾冲叆鍥捐氨鍐茬獊鍥哄畾鍏ュ彛鍜屽洖褰掓槧灏勩€?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- `verify:graph-conflicts` 鐜板湪宸茬粡涓嶅彧鏄€滃崟鍏?缁勪欢/椤甸潰鍥炲綊闆嗗悎鈥濓紝鑰屾槸鑳借嚦灏戝湪鐪熷疄棰勮鐜涓嬭窇閫氫竴鏉″浘璋卞伐浣滃尯 smoke锛屼负鍚庣画 `WB-034` 琛ユ洿瀹屾暣鐨勫浘璋卞洖褰掔煩闃垫彁渚涗簡鏇村彲闈犵殑鍥哄畾鍩哄骇銆?- 褰撳墠浠嶆湭瑕嗙洊鐪熸鐨勫啿绐?Playwright 鍦烘櫙銆佺獎灞?妗岄潰鍙屽竷灞€鐭╅樀鍜屾洿瀹屾暣鐨?create/save/restore/export/layout/conflict/鏉冮檺璺緞锛涘悗缁簲缁х画鍦ㄨ繖鏉″浐瀹氬叆鍙ｄ箣涓婃墿灞曪紝鑰屼笉鏄彟璧烽浂鏁ｅ懡浠ゃ€?
## 2026-07-09 07:14:00 +08:00 | v1.1.0-alpha.131 | 鏀跺彛 WB-032 鍥捐氨鍐茬獊鍥哄畾楠岃瘉鍏ュ彛
### 浠诲姟鍐呭

- 鍦ㄨ繛缁ˉ浜嗗杞?`WB-032` 椤甸潰绾у啿绐佸洖褰掑悗锛岀户缁仛涓€涓洿鍋忓叏灞€鐨勬敹鍙ｏ紝涓嶅啀鍙柊澧炲崟鏉″洖褰掞紝鑰屾槸缁欏綋鍓嶅浘璋卞啿绐佺煩闃靛缓绔嬪浐瀹氭墽琛屽叆鍙ｃ€?- 鏈疆鐩爣鏄儚 `verify:search` 閭ｆ牱锛屾妸鐜版湁鍥捐氨鍐茬獊鐩稿叧鐨勫墠绔〉闈?缁勪欢/helper 鍥炲綊銆佸悗绔敓鍛藉懆鏈熸祴璇曞拰鏂囨。鍚屾鏀跺彛鎴愬彲閲嶅鎵ц鐨勭粺涓€鍛戒护锛屽苟鎶婃祴璇曟槧灏勬矇鍒板崟涓€鏂囨。閲岋紝涓哄悗缁?`WB-034` 鐨勫浐瀹氶獙璇佹竻鍗曟墦搴曘€?### 瀹為檯鍙樻洿

- 鏂板 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛浠?RED 閿佸畾涓夌被缂哄彛锛氫粨搴撶己灏?`verify:graph-conflicts` 鍏ュ彛銆佺己灏戝浘璋卞啿绐佸洖褰掔煩闃垫枃妗ｃ€佷富鏂囨。閲屼篃娌℃湁杩欐潯鍥哄畾鍏ュ彛銆?- 鏇存柊 `package.json`锛屾柊澧烇細
  - `test:graph:conflicts:frontend`
  - `test:graph:conflicts:backend`
  - `verify:graph-conflicts`
- 鏂板 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`锛岄泦涓褰曞綋鍓嶅浘璋卞啿绐佺敓鍛藉懆鏈熻竟鐣屻€侀〉闈㈢骇閲嶇偣缁勫悎璺緞銆佸墠鍚庣娴嬭瘯鏄犲皠涓庢帹鑽愭墽琛屽叆鍙ｃ€?- 鏇存柊 `README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶?`npm run verify:graph-conflicts` 鎺ュ叆涓绘枃妗ｅ拰鎵ц璺嚎銆?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm run verify:graph-conflicts`
### 鍚庣画褰卞搷

- 褰撳墠鍥捐氨鍐茬獊鐭╅樀宸茬粡涓嶅啀鍙瓨鍦ㄤ簬闆舵暎娴嬭瘯鍛戒护鍜?`PROJECT_LOG.md` 鍙欒堪閲岋紝鑰屾槸鏈変簡鍥哄畾鎵ц鍏ュ彛鍜屽崟涓€鍥炲綊鏂囨。锛涘悗缁户缁ˉ `WB-032` 缁勫悎鍦烘櫙鏃讹紝鍙互鐩存帴鎺ュ埌杩欐潯鍏ュ彛涓婏紝鑰屼笉鏄噸澶嶆暣鐞嗗懡浠ゃ€?- 杩欒繕涓嶄唬琛?`WB-034` 宸插畬鎴愶紱鏇村畬鏁寸殑 Playwright 鍐茬獊 smoke銆佺獎灞?妗岄潰甯冨眬鐭╅樀鍜?create/save/restore/export/layout/conflict/鏉冮檺鍏ㄨ矾寰勶紝浠嶇劧闇€瑕佸湪杩欐潯鍏ュ彛鍩虹涓婄户缁墿灞曘€?
## 2026-07-09 07:10:00 +08:00 | v1.1.0-alpha.130 | 鏀跺彛 WB-032 latest-head 澶氱洰鏍囪繛鏈爣璁板洖閫€椤甸潰绾у洖褰?### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁睍椤甸潰绾у啿绐佺煩闃碉紝浣嗕繚鎸佹渶灏忛獙璇佹骞咃紝涓嶅湪杩欒疆寮曞叆鏂扮殑鍐茬獊閫昏緫銆?- 鏈疆鐩爣鏄妸 `latest-head` 鍒犻櫎璇箟涓嬬殑澶氱洰鏍囪繛绾胯矾寰勭户缁ˉ鍒版洿璐磋繎鐪熷疄鎿嶄綔鐨勯〉闈㈠洖褰掗噷锛氬綋鍓嶈崏绋垮厛娌跨敤鏈湴鍒犻櫎缁撴灉锛屽啀鍗曠嫭灏濊瘯淇濈暀鏈嶅姟绔鐩爣杩炵嚎锛岀敱鍐茬獊鍗＄墖缁欏嚭鑱斿姩寤鸿骞惰В闄ら樆鏂€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屾柊澧?latest-head 澶氱洰鏍囪繛绾块〉闈㈢骇缁勫悎鍦烘櫙锛氬厛鏍囪 `Server node` 涓?`Extra server node` 涓轰繚鐣欐湰鍦板垹闄ょ粨鏋滐紝鍐嶆爣璁?`Server edge` 涓轰繚鐣欐湇鍔＄锛岄殢鍚庢柇瑷€鍗＄墖浼氬嚭鐜?`杩炵嚎鈥淪erver edge鈥濅細寮曠敤鏈繚鐣欑殑鑺傜偣` 闃绘柇璇存槑銆乣鑱斿姩淇濈暀鏈嶅姟绔細鑺傜偣锝滃垹闄わ綔Server node`銆乣鑱斿姩淇濈暀鏈嶅姟绔細鑺傜偣锝滃垹闄わ綔Extra server node` 涓?`鑱斿姩淇濈暀鏈湴锛氳繛绾匡綔鍒犻櫎锝淪erver edge` 涓夌被寤鸿锛屽苟鍦?`涓€閿簲鐢?3 椤硅仈鍔ㄥ彇鑸嶅缓璁甡 鍚庤В闄ら樆鏂€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€渓atest-head 鍒犻櫎璇箟涓嬬殑澶氱洰鏍囪繛绾胯矾寰勫凡琚〉闈㈢骇鍐茬獊鍥炲綊閿佸畾鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `WB-032` 鐨勯〉闈㈢骇鍐茬獊鐭╅樀鐜板湪鍚屾椂瑕嗙洊浜?latest-head 鍒犻櫎璇箟涓嬬殑鍒嗙粍渚濊禆鍜屽鐩爣杩炵嚎锛屼笉鍐嶅彧鍋滅暀鍦ㄧ函 helper 鎴栧崟涓€瀵硅薄鍦烘櫙銆?- 涓嬩竴姝ユ洿閫傚悎缁х画琛モ€滄湭鏍囪榛樿鍥為€€ + 鍒嗙粍渚濊禆 + 澶氱洰鏍囪繛绾库€濊繖绫绘洿澶嶆潅鐨勭粍鍚堣矾寰勶紝鎴栬€呭紑濮嬫妸杩欎簺椤甸潰绾у洖褰掓暣鐞嗘垚 `WB-034` 鐨勫浐瀹氶獙璇佹竻鍗曘€?
## 2026-07-09 07:06:00 +08:00 | v1.1.0-alpha.129 | 鏀跺彛 WB-032 latest-head 澶氱洰鏍囪繛椤甸潰绾у洖褰?### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鎵╁睍椤甸潰绾у啿绐佺煩闃碉紝浣嗕粛淇濇寔灏忔楠岃瘉锛屼笉鍦ㄨ繖杞紩鍏ユ柊鐨勫啿绐侀€昏緫銆?- 鏈疆鐩爣鏄妸 `latest-head` 鍒犻櫎璇箟涓嬬殑澶氱洰鏍囪繛绾胯矾寰勪篃閿佽繘椤甸潰绾у洖褰掞細褰撳綋鍓嶈崏绋挎部鐢ㄦ湰鍦板垹闄ょ粨鏋溿€佸嵈灏濊瘯淇濈暀鏈嶅姟绔鐩爣杩炵嚎鏃讹紝鍐茬獊鍗＄墖蹇呴』鍚屾椂璇嗗埆涓荤洰鏍囪妭鐐瑰拰闄勫姞鐩爣鑺傜偣鐨勭己澶憋紝骞剁粰鍑?scope-aware 鐨勮仈鍔ㄥ缓璁€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屾柊澧?latest-head 澶氱洰鏍囪繛绾胯矾寰勶細鍏堟瀯閫犫€滀繚鐣欐湰鍦板垹闄ょ殑鏈嶅姟绔妭鐐?闄勫姞鐩爣鑺傜偣 + 淇濈暀鏈嶅姟绔繛绾库€濈殑鍐茬獊鐘舵€侊紝鍐嶆柇瑷€鍗＄墖浼氭樉绀?`杩炵嚎鈥淪erver edge鈥濅細寮曠敤鏈繚鐣欑殑鑺傜偣` 闃绘柇璇存槑銆乣鑱斿姩淇濈暀鏈嶅姟绔細鑺傜偣锝滃垹闄わ綔Server node`銆乣鑱斿姩淇濈暀鏈嶅姟绔細鑺傜偣锝滃垹闄わ綔Extra server node` 鍜?`鑱斿姩淇濈暀鏈湴锛氳繛绾匡綔鍒犻櫎锝淪erver edge` 涓夌被寤鸿锛屼互鍙?`涓€閿簲鐢?3 椤硅仈鍔ㄥ彇鑸嶅缓璁甡 鍚庨樆鏂В闄ゃ€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€渓atest-head 鍒犻櫎璇箟涓嬬殑澶氱洰鏍囪繛绾胯矾寰勪篃宸茶椤甸潰绾у洖褰掗攣瀹氣€濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `WB-032` 鐨勯〉闈㈢骇鍐茬獊鐭╅樀鐜板湪杩涗竴姝ヨ鐩栧埌浜?latest-head 鍒犻櫎璇箟涓嬬殑澶氱洰鏍囪繛绾匡紝涓嶅啀鍙鐩栨湰鍦版柊澧炲鐩爣渚濊禆銆?- 涓嬩竴姝ユ洿閫傚悎缁х画琛モ€滃鐩爣杩炵嚎 + 鍒嗙粍渚濊禆 + 鏈爣璁伴粯璁ゅ洖閫€鈥濅竴绫绘洿澶嶆潅鐨勭粍鍚堣矾寰勶紝鎴栬€呭紑濮嬫妸杩欎簺宸叉矇娣€鐨勯〉闈㈢骇鍥炲綊鏁寸悊鎴?`WB-034` 鐨勫浐瀹氶獙璇佹竻鍗曘€?
## 2026-07-09 07:02:00 +08:00 | v1.1.0-alpha.128 | 鏀跺彛 WB-032 latest-head 鍒嗙粍渚濊禆椤甸潰绾у洖褰?### 浠诲姟鍐呭

- 缁х画娌?`WB-032` 鍋氫竴涓渶灏忎絾鏇存帴杩戠湡瀹炵敤鎴疯矾寰勭殑楠岃瘉鏀跺彛锛屼笉鎵╂柊閫昏緫锛岃€屾槸鎶婁笂涓€杞凡缁忚惤鍦扮殑 latest-head 鍒犻櫎璇箟琛ュ埌椤甸潰绾у啿绐佺煩闃甸噷銆?- 鏈疆鐩爣鏄攣瀹氫竴涓粍鍚堝満鏅細褰撳綋鍓嶈崏绋挎部鐢ㄦ湰鍦板垹闄ょ粨鏋溿€佷絾鍙堝皾璇曚繚鐣欐湇鍔＄鍒嗙粍鏃讹紝鍐茬獊鍗＄墖蹇呴』鑳借瘑鍒?`invalid_group_node` 闃绘柇锛屽苟缁欏嚭鐪熸 scope-aware 鐨勮仈鍔ㄥ彇鑸嶅缓璁€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屾柊澧?latest-head `group/node` 鍒犻櫎璇箟鐨勯〉闈㈢骇鍥炲綊锛氬厛鏋勯€犫€滀繚鐣欐湰鍦板垹闄ょ殑鏈嶅姟绔妭鐐?+ 淇濈暀鏈嶅姟绔垎缁勨€濈殑鍐茬獊鐘舵€侊紝鍐嶆柇瑷€鍗＄墖浼氬嚭鐜?`鍒嗙粍鈥淪erver group鈥濅粛寮曠敤鏈繚鐣欑殑鑺傜偣` 闃绘柇璇存槑銆乣鑱斿姩淇濈暀鏈嶅姟绔細鑺傜偣锝滃垹闄わ綔Server node` 涓?`鑱斿姩淇濈暀鏈湴锛氬垎缁勶綔鍒犻櫎锝淪erver group` 涓ょ被寤鸿锛屼互鍙?`涓€閿簲鐢?2 椤硅仈鍔ㄥ彇鑸嶅缓璁甡 鍚庨樆鏂В闄ゃ€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€渓atest-head 鍒犻櫎璇箟涓嬬殑鍒嗙粍渚濊禆鍦烘櫙涔熷凡琚〉闈㈢骇鍥炲綊閿佸畾鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `WB-032` 鐜板湪涓嶄粎瑕嗙洊鏈湴鏂板瀵硅薄渚濊禆銆佸鐩爣杩炵嚎闄勫姞渚濊禆锛屼篃寮€濮嬭鐩?latest-head 鍒犻櫎璇箟涓嬬殑鍒嗙粍渚濊禆缁勫悎璺緞锛岄〉闈㈢骇鍐茬獊鐭╅樀鏇存帴杩戠湡瀹炲绔啿绐併€?- 涓嬩竴姝ユ洿閫傚悎缁х画琛?`dangling_edge` / `invalid_group_node` 涓?latest-head銆佸鐩爣渚濊禆銆佹湭鏍囪榛樿鍥為€€涔嬮棿鐨勬洿瀹屾暣缁勫悎鐭╅樀锛屽苟閫愭涓?`WB-034` 鏁寸悊鍥哄畾楠岃瘉娓呭崟銆?
## 2026-07-09 06:58:00 +08:00 | v1.1.0-alpha.127 | 鏀跺彛 WB-032 澶氱洰鏍囪繛绾块〉闈㈢骇鍥炲綊
### 浠诲姟鍐呭

- 鍦ㄤ笂涓€杞凡缁忚ˉ榻愬鐩爣杩炵嚎闄勫姞渚濊禆鑺傜偣鑱斿姩寤鸿鐨勫熀纭€涓婏紝缁х画娌?`WB-032` 鍋氫竴涓皬鑰岀ǔ鐨勯獙璇佹敹鍙ｃ€?- 鏈疆鐩爣涓嶆槸缁х画鎵╁啿绐侀€昏緫锛岃€屾槸鎶婅繖鏉¤涓虹湡姝ｉ攣杩涘伐浣滃尯椤甸潰绾у洖褰掞紝閬垮厤鍔熻兘鍙湪 `graphConflictSummary` 鍗曞厓灞傞€氳繃銆佷絾鍦ㄥ啿绐佸崱鐗囦氦浜掍笂鎮勬倓閫€鍥炪€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屾柊澧炩€滃鐩爣杩炵嚎闄勫姞鐩爣鑺傜偣鈥濆満鏅細褰撴湰鍦拌崏绋夸繚鐣欎竴鏉″甫 `metadata.targetNodeIds` 鐨勮繛绾挎椂锛屽啿绐佽緟鍔╁崱鐗囧繀椤诲悓鏃剁粰鍑轰富鐩爣鑺傜偣鍜岄檮鍔犵洰鏍囪妭鐐圭殑鑱斿姩淇濈暀寤鸿锛屽苟鏄剧ず `涓€閿簲鐢?3 椤硅仈鍔ㄥ彇鑸嶅缓璁甡銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃鐩爣杩炵嚎闄勫姞渚濊禆鑺傜偣宸茶椤甸潰绾у啿绐佸洖褰掗攣瀹氣€濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
### 鍚庣画褰卞搷

- `WB-032` 鐜板湪涓嶅彧鍦ㄧ函閫昏緫灞傝鐩栧鐩爣杩炵嚎闄勫姞渚濊禆鑺傜偣锛岄〉闈㈢骇鍐茬獊鍗＄墖浜や簰涔熻閿佷綇锛屼负鍚庣画 `WB-034` 鐨勫浘璋卞啿绐佸洖褰掔煩闃垫墦浜嗕竴鍧楁洿鎺ヨ繎鐪熷疄鐢ㄦ埛璺緞鐨勫湴鍩恒€?- 涓嬩竴姝ユ洿閫傚悎缁х画琛ユ洿澶?latest-head / group / multi-target 缁勫悎鍦烘櫙鐨勯〉闈㈢骇鍥炲綊锛屾垨閫愭寮€濮嬫暣鐞?`WB-034` 鎵€闇€鐨勫啿绐侀獙璇佺煩闃点€?
## 2026-07-09 06:53:00 +08:00 | v1.1.0-alpha.126 | 鎺ㄨ繘 WB-032 澶氱洰鏍囪繛绾胯仈鍔ㄥ彇鑸嶅瓙姝ラ
### 浠诲姟鍐呭

- 鎸?`CODEX_MASTER_PROMPT.md` 褰撳墠浼樺厛绾х户缁部 `WB-032` 鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫啿绐佸鐞嗘敹鍙ｏ紝涓嶈烦鍘绘柊鐨勫叡浜眰鎴栨帶鍒跺櫒鎷嗗垎銆?- 鏈疆鐩爣鏄ˉ榻愪竴涓湡瀹炰絾杈冮殣钄界殑渚濊禆缂哄彛锛氬綋 `dangling_edge` 鏉ヨ嚜澶氱洰鏍囪繛绾?`metadata.targetNodeIds` 涓殑缂哄け鑺傜偣鏃讹紝鑱斿姩鍙栬垗寤鸿涓嶅簲鍙洴浣忎富 `sourceNodeId / targetNodeId`锛岃繕搴旀彁绀轰繚鐣欒繖浜涢澶栦緷璧栬妭鐐广€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛屽厛鐢?RED 閿佸畾鈥滃鐩爣杩炵嚎寮曠敤鐨勯檮鍔犵洰鏍囪妭鐐硅閬楁紡鈥濊繖涓€缂哄彛锛氬綋鍓嶅彧浼氬缓璁洖閫€杩炵嚎锛屼笉浼氳仈鍔ㄨˉ榻?`targetNodeIds` 閲岀殑渚濊禆鑺傜偣銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛岃 `buildGraphConflictResolutionSuggestions(...)` 鍦ㄥ鐞?`dangling_edge` 鏃剁粺涓€鏀堕泦 `sourceNodeId`銆乣targetNodeId` 鍜?`metadata.targetNodeIds`锛屽苟瀵瑰幓閲嶅悗鐨勮妭鐐归泦鍚堢敓鎴愬悓涓€濂椻€滀繚鐣欎緷璧栬妭鐐?/ 鏀惧純闂杩炵嚎鈥濆缓璁€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃鐩爣杩炵嚎鐨勯檮鍔犱緷璧栬妭鐐逛篃鑳借繘鍏ヨ仈鍔ㄥ彇鑸嶅缓璁€濄€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
### 鍚庣画褰卞搷

- `WB-032` 鐨勮仈鍔ㄥ彇鑸嶅缓璁幇鍦ㄤ笉鍐嶅彧瑕嗙洊鏅€氬崟鐩爣杩炵嚎锛涘綋鍐茬獊鏉ヨ嚜澶氱洰鏍囪繛绾块檮甯︾殑棰濆鐩爣鑺傜偣鏃讹紝鍐茬獊鍗＄墖涔熻兘缁欏嚭鐪熸鍙墽琛岀殑琛ラ綈寤鸿銆?- 杩欎竴杞粛鐒舵病鏈夊畬鎴愭洿绯荤粺鐨?conflict handling锛涗笅涓€姝ユ洿閫傚悎缁х画琛ユ洿澶氱粍鍚堝瀷渚濊禆鍦烘櫙锛屾垨寮€濮嬫暣鐞?`WB-034` 鎵€闇€鐨勫浘璋卞啿绐佸洖褰掔煩闃点€?
## 2026-07-09 06:46:00 +08:00 | v1.1.0-alpha.125 | 鎺ㄨ繘 WB-032 latest-head 鍒犻櫎璇箟鑱斿姩寤鸿淇
### 浠诲姟鍐呭

- 鎸夊綋鍓嶄紭鍏堢骇缁х画娌?`WB-032` 鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫啿绐佸鐞嗘敹鍙ｏ紝鑰屼笉鏄烦鍘绘柊鐨勫叡浜眰鎴栨洿澶х殑閲嶆瀯銆?- 鏈疆鐩爣鏄慨姝ｄ竴涓湡瀹炵殑 latest-head 璇箟缂哄彛锛氬綋闃绘柇鏉ヨ嚜鈥滃綋鍓嶅彇鑸嶆兂娌跨敤鏈湴鍒犻櫎缁撴灉锛屽鑷存湇鍔＄杈?鍒嗙粍澶卞幓渚濊禆瀵硅薄鈥濇椂锛岃仈鍔ㄥ彇鑸嶅缓璁笉搴旂户缁満姊板湴鎺ㄨ崘 `keep-local` / `keep-latest`锛岃€屽簲缁欏嚭鐪熸鑳借В闄ら樆鏂殑鏂瑰悜銆?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛屽厛鐢?RED 閿佸畾涓€涓?latest-head 鍒犻櫎鍦烘櫙锛氬綋鍓嶈崏绋跨己灏戞湇鍔＄鑺傜偣涓庤繛绾匡紝鑻ョ敤鎴风户缁部鐢ㄦ湰鍦板垹闄ょ粨鏋滐紝鍐茬獊寤鸿蹇呴』鑳芥纭彁绀衡€滀繚鐣欐湇鍔＄鑺傜偣鈥濇垨鈥滄寜鏈湴鍒犻櫎缁撴灉澶勭悊璇ユ湇鍔＄杩炵嚎鈥濄€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛岃 `buildGraphConflictResolutionSuggestions(...)` 涓嶅啀鎶娾€滀繚鐣欏璞♀€濆浐瀹氬啓姝绘垚 `keep-local`銆佹妸鈥滄斁寮冨璞♀€濆浐瀹氬啓姝绘垚 `keep-latest`锛岃€屾槸鎸夊璞″樊寮傜殑 `action` 鍒ゆ柇鐪熸鐨勫缓璁柟鍚戯紱鍚屾椂鍦ㄧ敓鎴?`dangling_edge` / `invalid_group_node` 寤鸿鏃惰ˉ涓婂 `latestHead` 鏂囨。杈瑰拰鍒嗙粍鐨勮鍙栵紝閬垮厤鏈嶅姟绔璞″彧瀛樺湪浜庢渶鏂扮増鏈椂鐩存帴澶卞幓鑱斿姩寤鸿銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸 `latestConflictDetail` 缁х画涓嬩紶鍒板缓璁敓鎴愰€昏緫锛岀‘淇濋〉闈㈢骇鍐茬獊鍗＄墖涔熻兘娑堣垂杩欐 latest-head 鍒犻櫎璇箟淇銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€渓atest-head removed 瀵硅薄鐨勮仈鍔ㄥ缓璁柟鍚戝凡绾犳鈥濈殑鏈€鏂扮姸鎬併€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
### 鍚庣画褰卞搷

- `WB-032` 鐨勮仈鍔ㄥ彇鑸嶅缓璁幇鍦ㄤ笉鍐嶅彧瀵光€滄湰鍦版柊澧?淇敼瀵硅薄鈥濇柟鍚戞纭紱褰撻棶棰樺璞″彧瀛樺湪浜庢渶鏂版湇鍔＄鐗堟湰鏃讹紝鍐茬獊鍗＄墖涔熻兘缁欏嚭鐪熸鍙墽琛岀殑瑙ｉ櫎闃绘柇寤鸿銆?- 杩欎竴杞粛鐒舵病鏈夊畬鎴愭洿绯荤粺鐨?conflict handling锛涗笅涓€姝ユ洿閫傚悎缁х画琛ユ洿澶?latest-head / 璺ㄥ璞＄粍鍚堝満鏅殑椤甸潰绾у洖褰掞紝鎴栧紑濮嬫⒊鐞?`WB-034` 鎵€闇€鐨勫浘璋卞啿绐佺煩闃点€?
## 2026-07-09 07:18:00 +08:00 | v1.1.0-alpha.124 | 鏀跺彛 QA-010 榛樿瑕嗙洊鐜囧熀绾块棬绂?### 浠诲姟鍐呭

- 鍦?`SEC-011` 宸叉妸浠撳簱绾?secret scan 绾冲叆榛樿 CI 涔嬪悗锛岀户缁寜鈥滃厛鏀跺彛鍏ㄥ眬楠ㄦ灦鈥濈殑浼樺厛绾э紝琛ヤ笂鍓╀綑鐨?P0 宸ョ▼闂ㄧ缂哄彛锛屾妸瑕嗙洊鐜囦粠 release 鍓嶇殑浜哄伐姹囨€绘帹杩涗负榛樿娴佹按绾跨殑鏄惧紡纭棬绂併€?- 鏈疆鐩爣涓嶆槸寮鸿鎶婂叏浠撶珛鍒绘媺鍒?80%锛岃€屾槸鍏堟妸褰撳墠宸查獙璇佽鐩栫巼鍥哄寲涓衡€滀笉鍥為€€鈥濆熀绾匡紝骞舵妸杩欐潯绾︽潫娌夊埌鍙墽琛屾祴璇曘€佺粺涓€鑴氭湰鍜岄粯璁?CI 閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `scripts/coverage-baseline.test.mjs`锛屽厛浠?RED 閿佸畾鍥涚被缂哄彛锛氫粨搴撶己灏?`verify:coverage` 鍛戒护銆乣ci` 鏈樉寮忔墽琛岃鐩栫巼闂ㄧ銆丟itHub Actions 娌℃湁 coverage gate 姝ラ锛屼互鍙?README / 寮€鍙戣鏄?/ 鐗堟湰璁″垝 / release checklist 浠嶅彧璁板綍 `test:coverage` 鑰屾病鏈夐粯璁ょ‖闂ㄧ鍏ュ彛銆?- 鏂板 `scripts/verify-coverage-gates.mjs`锛岀粺涓€鏀跺彛鍥涘瑕嗙洊鐜囨潵婧愶細`frontend-user` 涓?`frontend-admin` 杩愯 Vitest coverage 骞惰鍙?JSON summary锛宍@studymate/graph-core` 瑙ｆ瀽 Node test coverage 鐨?`all files` 姹囨€伙紝鍚庣杩愯 `go test ./... -coverprofile` 骞剁敤 `go tool cover -func` 璇诲彇鎬讳綋 statements銆?- 灏嗗綋鍓嶄粨搴撳凡楠岃瘉瑕嗙洊鐜囧浐鍖栦负榛樿鈥滀笉鍥為€€鈥濆熀绾匡細`frontend-user` `statements/branches/functions/lines >= 68/63/67/68`锛宍frontend-admin >= 70/67/64/75`锛宍graph-core lines/branches/functions >= 96/79/100`锛屽悗绔€讳綋 `statements >= 25`銆?- 鏇存柊 `package.json`銆乣.github/workflows/ci.yml`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/planning/VERSION_PLAN.md`銆乣docs/planning/ROADMAP.md`銆乣docs/planning/versions/v1.0.0-release.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_PROJECT_CONTEXT.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶婇粯璁よ鐩栫巼闂ㄧ鍏ュ彛鏀跺彛涓?`npm run verify:coverage`锛屽苟鏄庣‘ `npm run test:coverage` 缁х画鎵挎媴鍙戝竷鍓嶈缁嗘眹鎬昏亴璐ｃ€?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/coverage-baseline.test.mjs`
- GREEN锛歚node --test scripts/coverage-baseline.test.mjs`
- `npm run verify:coverage`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- 榛樿 CI 鐜板湪涓嶅啀鍙湪 release checklist 閲屸€滄彁閱掕鐪嬭鐩栫巼姹囨€烩€濓紝鑰屾槸浼氱洿鎺ユ墽琛?`npm run verify:coverage`锛屽厛鎶婂墠鍚庡彴銆乬raph-core 鍜屽悗绔鐩栫巼鍥為€€鎸″湪鏈湴涓庢祦姘寸嚎鍏ュ彛銆?- 杩欎竴杞敹鍙ｇ殑鏄€滃熀绾夸笉鍥為€€鈥濈‖闂ㄧ锛岃€屼笉鏄€滃叏浠?80% 涓€姝ュ埌浣嶁€濓紱鍚庣画浠嶅簲娌?`FE-040`銆乣API-010`銆乣WB-032` 绛夐噷绋嬬缁х画琛ユ祴璇曘€佹彁鍗囩湡瀹炶鐩栫巼锛屽苟閫愭鎶珮榛樿闃堝€笺€?
## 2026-07-09 06:28:00 +08:00 | v1.1.0-alpha.122 | 鏀跺彛 SEC-010 渚濊禆瀹夊叏鍩虹嚎涓?CI 瀹¤闂ㄧ
### 浠诲姟鍐呭

- 鍦?`DEV-010` 宸叉彁渚?`verify:deps` 瀹¤鍏ュ彛鐨勫熀纭€涓婏紝缁х画閫夋嫨涓€涓鐩栭潰骞夸絾涓嶆繁鍏ヤ骇鍝佸姛鑳界殑鏂板伐浣滃寘锛屾妸鈥滃璁″凡缁忚兘鎶ュ嚭鏉モ€濇帹杩涘埌鈥滃綋鍓嶅熀绾垮凡缁忚鏀跺彛骞堕粯璁ゅ彈 CI 淇濇姢鈥濄€?- 鏈疆鐩爣涓嶆槸缁х画鎵╁睍涓氬姟妯″潡锛岃€屾槸閿佸畾鍓嶇閿佹枃浠朵腑鐨勫畨鍏ㄧ増鏈€佸悗绔?Go toolchain 涓庡叧閿緷璧栫殑 patch 涓嬮檺锛屽苟鎶婅繖缁勭害鏉熸矇鍒板彲鎵ц娴嬭瘯鍜岄粯璁ゆ祦姘寸嚎閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `scripts/dependency-security-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾 `vite` / `esbuild` / `undici` / `glob` 鐨勬渶浣庡畨鍏ㄧ増鏈€乣frontend-user` / `frontend-admin` 鐨?`vite` 鐗堟湰涓嬮檺銆佹牴 `vitest` / `@vitest/coverage-v8` / `@vue/test-utils` 鐗堟湰涓嬮檺锛屼互鍙?`backend/go.mod` 涓?`toolchain go1.26.5`銆乣golang.org/x/net v0.55.0`銆乣github.com/quic-go/quic-go v0.59.1` 涓?CI 鐨?Go patch 鐗堟湰銆?- 鏇存柊鏍?`package.json`銆乣frontend-user/package.json`銆乣frontend-admin/package.json` 涓?`package-lock.json`锛屾妸鍓嶇渚濊禆澹版槑鍜岄攣鏂囦欢涓€璧锋媺鍥?`vite ^7.3.6`銆乣vitest ^4.1.10`銆乣@vitest/coverage-v8 ^4.1.10`銆乣@vue/test-utils ^2.4.11` 鐨勫畨鍏ㄥ熀绾匡紝骞舵竻鎺夐攣鏂囦欢閲屾畫鐣欑殑 `esbuild` / `undici` / `glob` 鏃х増鏈€?- 鏇存柊 `backend/go.mod` 涓?`backend/go.sum`锛屾樉寮忓姞鍏?`toolchain go1.26.5`锛屽苟鍗囩骇 `golang.org/x/net` 鍒?`v0.55.0`銆乣github.com/quic-go/quic-go` 鍒?`v0.59.1`锛屽悓姝ュ甫涓?`qpack` 涓?`x/*` 渚濊禆鐨勬柊瀹夊叏鐗堟湰銆?- 鏇存柊 [.github/workflows/ci.yml](/E:/Code/1108026_rust_go/StudyMate/.github/workflows/ci.yml)銆乕docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)銆乕docs/engineering/CODEX_BACKLOG.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_BACKLOG.md)銆乕docs/engineering/CODEX_EXECUTION_ROADMAP.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_EXECUTION_ROADMAP.md) 涓?[docs/engineering/CODEX_PROJECT_CONTEXT.md](/E:/Code/1108026_rust_go/StudyMate/docs/engineering/CODEX_PROJECT_CONTEXT.md)锛屾妸 Go `1.26.5`銆乣verify:deps` 闂ㄧ鍜屾湰杞緷璧栧畨鍏ㄦ敹鍙ｇ姸鎬佸悓姝ュ洖宸ョ▼鏂囨。銆?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/dependency-security-baseline.test.mjs`
- GREEN锛歚node --test scripts/dependency-security-baseline.test.mjs`
- `npm run verify:deps`
- `npm run verify:runtimes`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm --workspace frontend-user run test -- src/styles/tokenSource.test.ts`
- `npm --workspace frontend-admin run test -- src/tokenSource.test.ts`
- `cd backend && go test ./...`
- `npm run verify:docs`
### 鍚庣画褰卞搷

- `verify:deps` 鐜板湪涓嶅啀鍙槸鈥滆兘鎶婃紡娲炴墦鍑烘潵鈥濈殑杈呭姪鍏ュ彛锛岃€屾槸褰撳墠鍩虹嚎鏈韩宸茬粡杞豢锛屽苟琚撼鍏ラ粯璁?CI 闂ㄧ锛涘悗缁鏋滈攣鏂囦欢鎴?Go 渚濊禆鍥為€€鍒板凡鐭ユ紡娲炵増鏈紝浼氬厛鍦ㄦ湰鍦板熀绾挎祴璇曞拰 CI 涓毚闇插嚭鏉ャ€?- 鍓╀綑鐨勫伐绋嬬骇 P0 缂哄彛涓嶅啀鏄€滀緷璧栧璁＄粨鏋滃皻鏈鐞嗏€濓紝鑰屾槸瑕嗙洊鐜囩‖闂ㄦ涓庢洿瀹屾暣鐨?secret scan锛涘悗缁簲缁х画浼樺厛鏀跺彛杩欎簺鍏ㄥ眬璐ㄩ噺闂ㄧ锛岃€屼笉鏄墿鏂板姛鑳藉煙銆?
## 2026-07-09 05:26:00 +08:00 | v1.1.0-alpha.120 | 鏀跺彛 API-011 浼氳瘽澶辨晥鍘熷洜涓庣粺涓€鎻愮ず璇箟
### 浠诲姟鍐呭

- 鍦?`API-011` 宸插畬鎴愬墠鍚庡彴鍏变韩 refresh/replay 绗竴娈甸鏋剁殑鍩虹涓婏紝缁х画閫夋嫨涓€涓鐩栭潰骞夸絾浠嶇劧瀹夊叏鍙帶鐨勬渶灏忓伐浣滃寘锛屾妸鈥渞efresh 澶辫触鍚庝负浠€涔堣鐧诲嚭鈥濅粠灞€閮ㄥ壇浣滅敤鎻愬崌涓哄叡浜敓鍛藉懆鏈熺殑涓€閮ㄥ垎銆?- 鏈疆鐩爣涓嶆槸缁х画鎵╁悗鍙版柊妯″潡锛岃€屾槸鍏堟敹鍙ｄ袱涓槑纭己鍙ｏ細浼氳瘽澶辨晥鍘熷洜璁板綍锛屼互鍙婂墠鍚庡彴鐧诲綍椤典竴鑷村彲璇荤殑 fail-logout 鎻愮ず璇箟銆?### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛屾柊澧?`SessionInvalidationState` 涓?`onSessionInvalidated(...)` 鍥炶皟锛涘叡浜?`createSessionRequest(...)` 鍦?refresh 澶辫触鏃朵笉鍐嶅彧浼氭竻 session锛屼篃浼氭妸缁撴瀯鍖栧け鏁堝師鍥犲洖鍐欏埌鍓嶅悗鍙颁細璇濆叆鍙ｃ€?- 鏇存柊 `frontend-user/src/app/sessionStore.ts` 涓?`frontend-admin/src/api/sessionStore.ts`锛屾妸 session 涓?invalidation 鍏冩暟鎹垎寮€鎸佷箙鍖栧苟寮€鏀捐鍐?璁㈤槄鍏ュ彛锛況efresh 鎴愬姛浼氭竻鎺夋棫 invalidation锛宺efresh 澶辫触浼氫繚鐣欏師鍥狅紝渚涚櫥褰曢〉鍜岃矾鐢卞眰娑堣垂銆?- 鏇存柊 `frontend-user/src/api/core.ts` 涓?`frontend-admin/src/api/client.ts`锛屾妸鏂扮殑 invalidation 鍥炶皟鎺ュ埌鍏变韩 refresh 鐢熷懡鍛ㄦ湡锛沗frontend-user/src/pages/AuthPages.tsx`銆乣frontend-user/src/app/routes.tsx` 涓?`frontend-admin/src/views/AdminWorkspaceView.vue` 鍒欒ˉ榻愮粺涓€ fail-logout 鎻愮ず锛屽苟鍦ㄦ墜鍔ㄩ€€鍑烘椂涓诲姩娓呯悊鏃ф彁绀恒€?- 鏇存柊 `packages/api-client/src/index.test.ts`銆乣frontend-user/src/api/sessionRefresh.test.ts`銆佹柊澧?`frontend-user/src/pages/AuthPages.test.tsx`锛屽苟鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛涘厛鐢?RED 澶嶇幇鈥渞efresh 澶辫触鍙竻 session銆佷笉璁板綍鍘熷洜鈥濆拰鈥滅櫥褰曢〉娌℃湁缁熶竴鎻愮ず鈥濈殑缂哄彛锛屽啀杞?GREEN 閿佸畾鍥炲綊銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸 `API-011` 鎺ㄨ繘鍒扳€滃墠鍚庡彴鍏变韩鍒锋柊楠ㄦ灦 + 澶辨晥鍘熷洜鎻愮ず璇箟宸叉敹鍙ｂ€濈殑鏈€鏂扮姸鎬併€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/api-client/src/index.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npx vitest run packages/api-client/src/index.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/pages/AuthPages.test.tsx src/api/graphs.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷

- `API-011` 鐜板湪涓嶅啀鍙細鍦?refresh 澶辫触鏃垛€滄妸浜鸿涪鍥炵櫥褰曢〉鈥濓紝鑰屾槸浼氭樉寮忎繚鐣欏け鏁堝師鍥犲苟鍦ㄥ墠鍚庡彴鐧诲綍椤电粰鍑虹粺涓€鎻愮ず锛涘悗缁柊璇锋眰杈圭晫涓嶉渶瑕佸啀鍚勮嚜琛ヤ竴濂楀眬閮?fail-logout 鏂囨銆?- 杩欎竴杞粛鐒舵病鏈夎В鍐?HttpOnly Refresh Token 杩佺Щ璇存槑銆佹洿澶氬悗鍙版ā鍧?API 鎺ョ嚎涓庡悗鍙?Router 妯″潡鍖栵紱鍚庣画搴旂户缁部 `API-011 / ADM-010` 鏀跺彛锛岃€屼笉鏄洖鍒伴〉闈㈤噷鏁ｈ惤鏂扮殑浼氳瘽 helper銆?
## 2026-07-09 04:56:33 +08:00 | v1.1.0-alpha.119 | 鎺ㄨ繘 API-011 绠＄悊绔叡浜細璇濆埛鏂拌捣姝?### 浠诲姟鍐呭

- 鍦?`API-011` 宸插畬鎴愮敤鎴风鍏变韩 refresh/replay/fail-logout 璧锋鐨勫熀纭€涓婏紝缁х画閫夋嫨涓€涓鐩栭潰骞夸絾浠嶇劧瀹夊叏鍙帶鐨勬渶灏忓伐浣滃寘锛屾妸鍚屼竴濂椾細璇濈敓鍛藉懆鏈熸帴鍒?`frontend-admin`銆?- 鏈疆鐩爣涓嶆槸鎵╂柊鍚庡彴娌荤悊妯″潡锛岃€屾槸鍏堣绠＄悊绔櫥褰曞悗鑷妇銆佷护鐗岃繃鏈熼噸璇曚笌鍒锋柊澶辫触閫€鍥炵櫥褰曢〉杩欐潯鍩虹璺緞杩涘叆鍏变韩灞傦紝閬垮厤鍓嶅悗鍙扮户缁悇鑷暎钀芥湰鍦颁細璇濋€昏緫銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛岃鍏变韩 `createSessionRequest(...)` 鏀寔鏄惧紡 `sessionOverride`锛岀鐞嗙鍦ㄤ粛鐒朵紶鍏ュ綋鍓嶉〉闈?session 鐨勫満鏅笅锛屼篃鑳藉弬涓庡叡浜?401 refresh/replay 鐢熷懡鍛ㄦ湡銆?- 鏂板 `frontend-admin/src/api/sessionStore.ts`锛屾妸鍚庡彴 `studymate.admin.session` 鐨勮鍙栥€佹寔涔呭寲銆佹竻鐞嗕笌璁㈤槄缁熶竴鏀跺彛鎴愬彲澶嶇敤 store銆?- 鏇存柊 `frontend-admin/src/api/client.ts`锛岀粺涓€閫氳繃鍏变韩 `createSessionRequest(...)` 涓?`/api/v1/auth/refresh` 鍒锋柊鍚庡彴 Access Token锛屽苟鍦ㄥ埛鏂版垚鍔熷悗鎸佷箙鍖栨渶鏂?session銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岀櫥褰曘€佽嚜涓句笌閫€鍑烘祦绋嬫敼涓烘秷璐瑰叡浜?session store锛涘綋鍚姩闃舵鎴栬姹傞樁娈?refresh 澶辫触鏃讹紝浼氭竻绌哄悗鍙版湰鍦颁細璇濄€侀噸缃不鐞嗗伐浣滃彴鐘舵€佸苟鍥為€€鍒扮櫥褰曠晫闈€?- 鏇存柊 `frontend-admin/src/api/client.test.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屽厛鐢?RED 澶嶇幇鈥滃悗鍙颁护鐗岃繃鏈熷悗涓嶄細鑷姩鍒锋柊閲嶆斁鈥濆拰鈥滃悗鍙板惎鍔ㄦ椂 refresh 澶辫触涓嶄細閫€鍥炵櫥褰曗€濈殑闂锛屽啀杞?GREEN 閿佸畾鍥炲綊銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸 `API-011` 鎺ㄨ繘鍒扳€滃墠鍚庡彴鍏变韩浼氳瘽鍒锋柊楠ㄦ灦鍧囧凡璧锋鈥濈殑鏈€鏂扮姸鎬併€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/api/client.test.ts`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts src/api/graphs.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `API-011` 鐜板湪涓嶅啀鍙仠鐣欏湪鐢ㄦ埛绔紱鍓嶅悗鍙伴兘宸插紑濮嬪鐢ㄥ悓涓€濂?refresh/replay 鍩虹嚎锛屽悗缁柊鍚庡彴璇锋眰杈圭晫涓嶉渶瑕佸啀浠庡ご鏁ｈ惤浼氳瘽鍒锋柊閫昏緫銆?- 杩欎竴杞粛鐒跺彧鏄鐞嗙绗竴娈垫帴绾匡細浼氳瘽澶辨晥鍘熷洜璁板綍銆佺粺涓€ fail-logout 鎻愮ず璇箟銆佹洿澶氬悗鍙版ā鍧?API 鎷嗗垎涓?HttpOnly Refresh Token 杩佺Щ璇存槑浠嶆湭瀹屾垚锛屽悗缁簲缁х画娌?`API-011 / ADM-010` 鏀跺彛锛岃€屼笉鏄洖鍒板崟椤靛伐浣滃彴閲屽彔鍔犲眬閮?helper銆?
## 2026-07-09 04:40:56 +08:00 | v1.1.0-alpha.118 | 鎺ㄨ繘 API-011 鐢ㄦ埛绔叡浜細璇濆埛鏂拌捣姝?### 浠诲姟鍐呭

- 鍦?`API-010` 宸插畬鎴愬叡浜?request/error/auth-header銆乹uery/pagination 鍙傛暟鎷兼帴涓?JSON 璇锋眰浣撳綊涓€鍖栬捣姝ョ殑鍩虹涓婏紝缁х画娌?`API-011` 閫夋嫨涓€涓鐩栭潰骞夸絾椋庨櫓鍙帶鐨勬渶灏忓伐浣滃寘銆?- 鏈疆鐩爣鏄妸 Access Token 杩囨湡鍚庣殑 refresh/replay/fail-logout 楠ㄦ灦鍏堟矇鍒板叡浜眰锛屽苟鑷冲皯鎺ラ€氱敤鎴风涓€鏉＄湡瀹炲彈淇濇姢璇锋眰璺緞锛岃€屼笉鏄户缁湪涓氬姟 API 鏂囦欢閲屾暎钀芥湰鍦?401 澶勭悊銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛屾柊澧?`ApiRequestError` 涓?`createSessionRequest(...)`锛岃鍏变韩璇锋眰灞傚紑濮嬫壙鎺?401 鍗曟 refresh/replay銆佸苟鍙?refresh 鍘婚噸锛屼互鍙?refresh 澶辫触鏃舵竻鐞嗘湰鍦?session 鐨勬渶灏忕敓鍛藉懆鏈熴€?- 鏇存柊 `packages/api-client/src/index.test.ts`锛屽厛浠?RED 閿佸畾鈥滀袱涓苟鍙戝彈淇濇姢璇锋眰鍦?Access Token 杩囨湡鍚庡彧瑙﹀彂涓€娆?refresh锛屽苟鍦ㄦ柊 token 涓嬪叡鍚岄噸鏀锯€濈殑琛屼负锛屽啀杞?GREEN銆?- 鏂板 `frontend-user/src/app/sessionStore.ts`锛屾妸鐢ㄦ埛绔?session 鎸佷箙鍖栨敹鍙ｄ负鍙闃呭瓨鍌紱`frontend-user/src/app/routes.tsx` 鏀逛负閫氳繃 `useSyncExternalStore(...)` 璁㈤槄 session锛屼繚璇?refresh 鎴愬姛鎴栧け璐ュ悗锛岃矾鐢辨€佽兘璺熼殢鏈€鏂版寔涔呭寲鐘舵€佹洿鏂般€?- 鏇存柊 `frontend-user/src/api/core.ts`锛岀粺涓€閫氳繃鍏变韩 `createSessionRequest(...)` 涓?`/api/v1/auth/refresh` 鍒锋柊 Access Token锛沗withAuth(...)` 涔熶細浼樺厛娑堣垂鏈€鏂版寔涔呭寲 session锛岄伩鍏嶆棫椤甸潰 props 鎶?stale token 鍐嶆鍐欏洖璇锋眰澶淬€?- 鏂板 `frontend-user/src/api/sessionRefresh.test.ts` 鐨?RED/GREEN 闂幆锛屽鐜板浘璋卞垪琛ㄥ湪 401 鍚庝笉浼氳嚜鍔ㄦ仮澶嶇殑闂锛屽苟閿佸畾 refresh 鎴愬姛鍚庢洿鏂版湰鍦?session銆佸啀閲嶆斁鍘熻姹傜殑鐢ㄦ埛绔矾寰勩€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸 `API-011` 浠庣函寰呭姙鎺ㄨ繘鍒扳€滅敤鎴风鍏变韩鍒锋柊楠ㄦ灦宸茶捣姝モ€濈殑鏈€鏂扮姸鎬併€?
### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/api-client/src/index.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
- GREEN锛歚npx vitest run packages/api-client/src/index.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/sessionRefresh.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/sessionRefresh.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `packages/api-client` 鐜板湪涓嶅彧缁熶竴 request/error/query/JSON body锛屼篃寮€濮嬬粺涓€鐢ㄦ埛绔殑 401 refresh/replay 璇箟锛涘悗缁柊鐨勫彈淇濇姢璇锋眰璺緞涓嶉渶瑕佸啀鍦ㄤ笟鍔?API 妯″潡閲岄噸澶嶈ˉ鏈湴鍒锋柊閫昏緫銆?- 杩欎竴杞粛鍙畬鎴愪簡 API-011 鐨勭敤鎴风绗竴娈甸鏋讹紝`frontend-admin` 杩樻病鏈夋帴鍏ュ悓涓€濂?refresh/replay/fail-logout锛屼細璇濆け鏁堝師鍥犺褰曚笌 HttpOnly Refresh Token 杩佺Щ璇存槑涔熷皻鏈ˉ榻愶紱鍚庣画浠嶅簲缁х画娌?`API-011` 鏀跺彛锛岃€屼笉鏄洖鍒板悇绔眬閮ㄦ嫾瑁呬細璇濈敓鍛藉懆鏈熴€?
## 2026-07-09 04:24:00 +08:00 | v1.1.0-alpha.117 | 鎺ㄨ繘 API-010 鍏变韩 JSON 璇锋眰浣撶紪鐮佽捣姝?### 浠诲姟鍐呭

- 鍦?`API-010` 宸插畬鎴愬叡浜?request/error/auth-header銆佺鐞嗙璇锋眰杈圭晫鎶界涓?query/pagination 鍙傛暟鎷兼帴璧锋鐨勫熀纭€涓婏紝缁х画閫夋嫨涓€涓寖鍥村皬浣嗚鐩栭潰骞跨殑鍏变韩灞傛敹鍙ｇ偣銆?- 鏈疆鐩爣鏄妸 plain object / array 鐨?JSON 璇锋眰浣撶紪鐮佷粠鍓嶅悗鍙板悇涓?API 璋冪敤鐐规敹鍥炲埌 `packages/api-client`锛岄伩鍏嶇户缁湪涓氬姟 API 鏂囦欢閲屾暎钀?`JSON.stringify(...)`銆?### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛屾柊澧?`ApiRequestInit`銆丣SON/body 褰掍竴鍖栭€昏緫涓庣被鍨嬪畧鍗紝璁?`requestApi(...)` 鍙洿鎺ユ帴鏀?plain object / array锛屽苟缁熶竴搴忓垪鍖栦负 JSON锛涘悓鏃剁户缁繚鐣?`FormData`銆乣Blob`銆乣URLSearchParams`銆乣ArrayBuffer` 绛夊師鐢?body 鐨勭洿閫氳兘鍔涖€?- 鏇存柊 `packages/api-client/src/index.test.ts`锛屾妸鍏变韩璇锋眰灞傛祴璇曟敼涓虹洿鎺ヤ紶瀵硅薄璇锋眰浣擄紝閿佸畾鈥滃叡浜眰璐熻矗 JSON 搴忓垪鍖栧苟琛ラ綈 `Content-Type`鈥濈殑鏂拌竟鐣屻€?- 鏇存柊 `frontend-user/src/api/core.ts`锛屾妸鐢ㄦ埛绔熀纭€ request 鍏ュ弬绫诲瀷鍒囧埌鍏变韩 `ApiRequestInit`锛岃涓氬姟鍩?API 鍙互鐩存帴鎶婂璞¤姹備綋浜ょ粰鍏变韩灞傘€?- 鏇存柊 `frontend-user/src/api/auth.ts`銆乣community.ts`銆乣graphs.ts`銆乣materials.ts`銆乣notes.ts`銆乣reader.ts`銆乣review.ts` 涓?`share.ts`锛岀Щ闄ゅ悇鑷墜鍐欑殑 `JSON.stringify(...)`锛岀粺涓€鏀逛负鐩存帴浼犲璞℃垨鏁扮粍銆?- 鏇存柊 `frontend-admin/src/api/client.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.vue`锛岃绠＄悊绔?`adminPost(...)` 涓庨〉闈㈠唴 `post(...)` 鍖呰鍑芥暟鐩存帴澶嶇敤鍏变韩灞傜殑 JSON 璇锋眰浣撶害瀹氥€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸 `API-010` 鎺ㄨ繘鍒扳€滃叡浜眰宸插紑濮嬫壙鎺?JSON 璇锋眰浣撶紪鐮佲€濈殑鏈€鏂扮姸鎬併€?### 楠岃瘉缁撴灉

- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/api/reader.test.ts src/api/reviewAi.test.ts src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `API-010` 鐜板湪涓嶄粎缁熶竴浜?request/error/auth-header 涓?query/pagination 鍙傛暟鎷兼帴锛屼篃寮€濮嬬粺涓€ JSON 璇锋眰浣撶紪鐮侊紱鍚庣画鏂板鍓嶅悗鍙?API 鏃讹紝涓嶉渶瑕佸啀浠庡悇绔笟鍔℃枃浠堕噷閲嶅鍐欏簭鍒楀寲缁嗚妭銆?- 杩欎竴杞粛鐒跺彧鏄€淛SON 璇锋眰浣撶紪鐮佽捣姝モ€濓紝杩樻病鏈夊舰鎴愬畬鏁寸殑鍒嗛〉鍝嶅簲 DTO銆佷笂浼犺涔夌煩闃点€?01 refresh/replay/fail-logout 涓庣粺涓€浼氳瘽澶辨晥澶勭悊锛屽悗缁粛搴旂户缁部 `API-010 / API-011` 鎺ㄨ繘銆?
## 2026-07-09 04:15:00 +08:00 | v1.1.0-alpha.116 | 鎺ㄨ繘 API-010 鍏变韩 query 涓庡垎椤靛弬鏁版嫾鎺ヨ捣姝?### 浠诲姟鍐呭

- 鍦?`API-010` 宸插畬鎴愬叡浜?request/error/auth-header 璧锋鍜岀鐞嗙璇锋眰杈圭晫鎶界鐨勫熀纭€涓婏紝缁х画閫夋嫨鏈€灏忎絾鑳芥墿澶у叡浜眰瑕嗙洊闈㈢殑涓嬩竴姝ャ€?- 鏈疆鐩爣鏄妸鏌ヨ鍙傛暟涓庡垎椤靛弬鏁版嫾鎺ヤ粠椤甸潰鍜屽崟涓?API 鏂囦欢涓娊鍒?`packages/api-client`锛岃鐢ㄦ埛绔悳绱㈠拰绠＄悊绔不鐞嗗垪琛ㄥ紑濮嬪叡浜悓涓€濂?query 璇箟銆?### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛屾柊澧?`buildApiPath(...)`锛岀粺涓€澶勭悊宸叉湁 query銆佹暟缁?filters銆乣limit` 绛夊弬鏁版嫾鎺ワ紝骞惰烦杩?`null` / `undefined` / 绌烘暟缁勩€?- 鏇存柊 `packages/api-client/src/index.test.ts`锛岃ˉ榻愬叡浜?query helper 鐨?RED/GREEN 瑕嗙洊锛岄攣瀹氣€滄暟缁勬寜閫楀彿鎷兼帴銆佸凡鏈?query 琚繚鐣欍€佺┖鍊艰蹇界暐鈥濈殑琛屼负銆?- 鏇存柊 `frontend-user/src/api/search.ts`锛岃鎼滅储璇锋眰鐨?`q`銆乣types`銆乣limit` 鏀逛负閫氳繃 `buildApiPath(...)` 鐢熸垚锛屼笉鍐嶆湰鍦扮淮鎶?`URLSearchParams`銆?- 鏇存柊 `frontend-admin/src/api/client.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.vue`锛岃绠＄悊绔不鐞嗗垪琛ㄧ殑 `limit=20` 鏀逛负閫氳繃鍏变韩 helper 鐢熸垚锛岃€屼笉鏄妸 `?limit=20` 鍐欐鍦ㄩ〉闈㈤厤缃噷銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸鈥渜uery/pagination 鍙傛暟鎷兼帴宸插紑濮嬬粺涓€鈥濆啓鍥炴墽琛屽熀绾裤€?### 楠岃瘉缁撴灉

- `npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts`
- `npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `API-010` 鐜板湪涓嶅彧缁熶竴浜?request/error/auth-header锛屼篃寮€濮嬬粺涓€ query/pagination 鐨勫弬鏁版嫾鎺ワ紱鍚庣画琛ョ湡姝ｇ殑鍒嗛〉 DTO 鎴?cursor 璇箟鏃讹紝涓嶉渶瑕佸啀鍥炲埌鍚勭浠庡ご鎵嬪啓 query 缁勮銆?- 杩欎竴杞粛鐒跺彧鏄€滃弬鏁版嫾鎺ヨ捣姝モ€濓紝杩樻病鏈夊舰鎴愬畬鏁寸殑鍒嗛〉鍝嶅簲濂戠害銆佸垎椤靛厓鏁版嵁绫诲瀷鎴?401 浼氳瘽閲嶆斁鑳藉姏锛屽悗缁粛搴旂户缁部 `API-010 / API-011` 鎺ㄨ繘銆?
## 2026-07-09 04:11:00 +08:00 | v1.1.0-alpha.115 | 鎺ㄨ繘 API-010 绠＄悊绔叡浜姹傝竟鐣屽嚭澹?### 浠诲姟鍐呭

- 鍦?`API-010` 宸插畬鎴愬叡浜?request/error/auth-header 璧锋鐨勫熀纭€涓婏紝缁х画鎸夋渶灏忓伐浣滃寘鏀跺彛绠＄悊绔〉闈㈠垎灞傦紝閬垮厤 `AdminWorkspaceView.vue` 缁х画鎸佹湁鏈湴璇锋眰 helper銆?- 鏈疆鐩爣涓嶆槸鎵╁睍鏂板悗鍙版ā鍧楋紝鑰屾槸鎶婂凡瀛樺湪鐨勫悗鍙?`get/post` 璇锋眰杈圭晫鎶藉埌鐙珛 API 鏂囦欢锛屽苟鐢ㄦ祴璇曟妸杩欏眰鍏变韩鎺ョ嚎閿佷綇銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/api/client.ts`锛屽鍑?`adminGet(...)` 涓?`adminPost(...)`锛岀粺涓€閫氳繃 `@studymate/api-client` 鐨?`requestApi(...)` / `createAuthHeaders(...)` 鍙戣捣鍚庡彴璇锋眰銆?- 鏂板 `frontend-admin/src/api/client.test.ts`锛屽厛浠?RED 閿佸畾鈥滅鐞嗙鍏变韩 API 妯″潡蹇呴』瀛樺湪鈥濓紝鍐嶅湪 GREEN 闃舵閿佸畾 Bearer header 涓?JSON POST body 閮界敱鍏变韩 client 璐熻矗銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岀Щ闄ら〉闈㈠唴鏈湴 `get/post` 璇锋眰鎷艰閫昏緫锛屾敼涓烘秷璐?`../api/client`锛岃瑙嗗浘灞傚洖鍒版洿绾补鐨勫伐浣滃彴缁勫悎瑙掕壊銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸鈥滅鐞嗙璇锋眰杈圭晫宸插紑濮嬫娊绂烩€濆啓鍥炴墽琛屽熀绾裤€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/api/client.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/api/client.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- 绠＄悊绔悗缁户缁媶 `ADM-010 / API-010` 鏃讹紝宸茬粡鏈変簡鍙鐢ㄧ殑鍏变韩璇锋眰鍏ュ彛锛屼笉闇€瑕佸啀鎶婃渶鍩虹鐨?header銆乥ody 鍜?request helper 鏁ｈ惤鍥為〉闈€?- 杩欎竴杞粛鍙畬鎴愪簡鏈€灏?request 杈圭晫鍑哄３锛涘悗鍙版洿澶氭ā鍧?DTO銆佸垎椤佃涔夊拰浼氳瘽鐢熷懡鍛ㄦ湡杩樻病鏈夌湡姝ｇ嫭绔嬪嚭鏉ワ紝鍚庣画浠嶅簲缁х画娌?`API-010 / API-011 / ADM-010` 鏀跺彛銆?
## 2026-07-09 04:06:00 +08:00 | v1.1.0-alpha.114 | 鎺ㄨ繘 API-010 鍏变韩璇锋眰鍩虹灞傝捣姝?### 浠诲姟鍐呭

- 鎸?`CODEX_MASTER_PROMPT.md` 涓庡綋鍓?`CODEX_BACKLOG.md` 鐨勪紭鍏堢骇锛岀户缁€夋嫨渚濊禆宸叉弧瓒充笖鑼冨洿鏈€灏忕殑 `API-010` 宸ヤ綔鍖咃紝鑰屼笉鏄垏鍘绘柊澧炰笟鍔″煙銆?- 鏈疆鐩爣鏄湪涓嶉噸鍐欏墠鍚庡彴浼氳瘽閫昏緫鐨勫墠鎻愪笅锛岃 `packages/api-client` 鍏堟壙鎺ユ渶灏忓叡浜姹傚眰锛氱粺涓€ success/error envelope 瑙ｆ瀽銆丅earer header 鎷艰涓庡熀纭€ request helper锛屽苟鎺ョ嚎鍒扮敤鎴风鍜岀鐞嗙銆?### 瀹為檯鍙樻洿

- 鏇存柊 `packages/api-client/src/index.ts`锛屾柊澧?`ApiSuccessPayload` / `ApiErrorPayload`銆乣readApiResponse(...)`銆乣requestApi(...)` 涓?`createAuthHeaders(...)`锛屽苟璁?`getHealth(...)` 澶嶇敤鍚屼竴濂楀叡浜姹傚叆鍙ｃ€?- 鏂板 `packages/api-client/src/index.test.ts`锛屽厛浠?RED 閿佸畾鈥滈壌鏉?header 鍙湪鏈?token 鏃舵敞鍏ャ€丣SON envelope 浼氳姝ｇ‘瑙ｅ寘銆乣FormData` 涓婁紶涓嶄細琚己濉?`Content-Type`銆丄PI 閿欒浼氭姏鍑?message鈥濓紝鍐嶈浆 GREEN銆?- 鏇存柊 `frontend-user/src/api/core.ts`锛屾妸鐢ㄦ埛绔熀纭€ request 涓?auth header 鎷艰鍒囧埌 `@studymate/api-client`锛涙洿鏂?`frontend-user/src/api/types.ts`锛岀Щ闄ゆ湰鍦伴噸澶嶇殑 success/error envelope 绫诲瀷銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃鍚庡彴宸ヤ綔鍙扮殑 `get(...)` / `post(...)` 鏀逛负閫氳繃鍏变韩 `requestApi(...)` 涓?`createAuthHeaders(...)` 璇锋眰鍚庡彴锛屽苟绉婚櫎涓嶅啀浣跨敤鐨勬湰鍦板搷搴旇В鏋?helper銆?- 鏇存柊 `frontend-user/package.json`銆乣frontend-admin/package.json` 涓?`package-lock.json`锛屾樉寮忓０鏄?`@studymate/api-client` workspace 渚濊禆锛岄伩鍏嶅叡浜帴绾垮彧渚濊禆鏍圭幆澧冨伓鐒惰В鏋愭垚鍔熴€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `API-010` 浠庣函寰呭姙鎺ㄨ繘鍒扳€滃叡浜姹傚熀纭€灞傚凡璧锋鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/api-client/src/index.test.ts`
- GREEN锛歚npx vitest run packages/api-client/src/index.test.ts`
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:user`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `@studymate/api-client` 涓嶅啀鍙槸鍋ュ悍妫€鏌ュ崰浣嶅寘锛屽悗缁柊椤甸潰鑷冲皯鍙互娌跨潃鍏变韩 request/error/auth-header 灞傜户缁墿灞曪紝鑰屼笉鐢ㄥ啀浠庨〉闈㈤噷閲嶅啓鏈€鍩虹鐨?fetch 鍒嗘敮銆?- 杩欎竴杞粛鍙畬鎴愪簡鍏变韩璇锋眰鍩虹灞傝捣姝ワ紱鍒嗛〉銆佹洿澶氫笂浼犺矾寰勩€?01 refresh/replay/fail-logout 涓庣粺涓€浼氳瘽澶辨晥澶勭悊浠嶆湭鏀跺彛锛屼笅涓€姝ュ簲缁х画娌?`API-010 / API-011` 鎺ㄨ繘锛岃€屼笉鏄噸鏂板湪鍚勭鏁ｈ惤鏂扮殑鏈湴 helper銆?
## 2026-07-09 03:53:30 +08:00 | v1.1.0-alpha.113 | 鎺ㄨ繘 FE-040 绠＄悊绔帴鍏ュ叡浜璁?token 璧锋
### 浠诲姟鍐呭

- 寤剁画蹇€熷師鍨嬮樁娈碘€滃厛鎶婂叏灞€楠ㄦ灦鏀惰捣鏉モ€濈殑鏂瑰悜锛岀户缁部 `FE-040` 鏀跺彛鍓嶅悗鍙扮殑鍏变韩瑙嗚婧愬ご锛岃€屼笉鏄洖鍒板崟鐐瑰姛鑳芥繁鎸栥€?- 鏈疆鐩爣鏄湪涓嶉噸鍐欏悗鍙板伐浣滃彴缁撴瀯鐨勫墠鎻愪笅锛岃 `frontend-admin` 涔熸帴鍏?`@studymate/ui/tokens.css`锛屾妸绠＄悊绔渶鍩虹鐨勮儗鏅€佹枃鏈€佹弿杈瑰拰 accent 璇箟鍏堝榻愬埌鍏变韩 token銆?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/main.ts`锛屾柊澧?`@studymate/ui/tokens.css` 瀵煎叆锛岃绠＄悊绔富鍏ュ彛涓庣敤鎴风鍏辩敤鍚屼竴浠芥牴 token 鏍峰紡鏉ユ簮銆?- 鏇存柊 `frontend-admin/src/components/admin/admin.css`锛岀Щ闄ゆ湰鍦?`:root` token bootstrapping锛屽苟鎶?`--admin-bg`銆乣--admin-surface`銆乣--admin-surface-soft`銆乣--admin-line`銆乣--admin-text`銆乣--admin-text-soft`銆乣--admin-text-muted`銆乣--admin-accent`銆乣--admin-accent-strong`銆乣--admin-accent-soft`銆乣--admin-danger` 鏄犲皠鍒板叡浜?token銆?- 鏇存柊 `frontend-admin/package.json` 涓?`package-lock.json`锛屾樉寮忓０鏄?`@studymate/ui` workspace 渚濊禆鍜?`@types/node` 娴嬭瘯绫诲瀷渚濊禆锛岄伩鍏嶈繖鏉℃帴绾垮彧渚濊禆鏍圭幆澧冨伓鐒跺彲鐢ㄣ€?- 鏂板 `frontend-admin/src/tokenSource.test.ts`锛屽厛浠?RED 閿佸畾鈥滅鐞嗙涓诲叆鍙ｅ繀椤诲鍏ュ叡浜?token銆乤dmin 鍩虹鍙橀噺蹇呴』寮曠敤鍏变韩 token銆佹湰鍦版牴 token 寮曞鍧楀繀椤荤Щ闄も€濓紝鍐嶈浆 GREEN銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 FE-040 浠庘€滃彧鏈夌敤鎴风鎺ョ嚎鈥濇帹杩涘埌鈥滃墠鍚庡彴鍏ュ彛閮藉凡鎺ュ叆鍏变韩 token鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run frontend-admin/src/tokenSource.test.ts`
- GREEN锛歚npx vitest run frontend-admin/src/tokenSource.test.ts`
- `npm --workspace frontend-admin run test`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- 鍓嶅悗鍙扮幇鍦ㄨ嚦灏戝凡缁忓紑濮嬪叡浜悓涓€浠借璁?token 婧愬ご锛屽悗缁户缁粺涓€鎸夐挳銆佽緭鍏ユ銆佺姸鎬佸崱鐗囧拰鎶藉眽/妫€鏌ュ櫒鐨勮瑙夊绾︽椂锛屼笉闇€瑕佸啀鍚勮嚜浠庡ご瀹氫箟鑳屾櫙銆佽竟绾垮拰鏂囧瓧灞傜骇銆?- 杩欎竴杞粛鍙畬鎴愪簡绠＄悊绔熀纭€澹冲眰鍙橀噺鐨勫叡浜帴鍏ワ紝鍚庡彴灞€閮ㄧ‖缂栫爜棰滆壊銆佹洿澶?primitives 浠ュ強鍏变韩 API/client 濂戠害閮借繕娌℃湁杩涗竴姝ユ敹鍙ｏ紱杩欎簺浠嶇劧鏄?`FE-040 / FE-041 / API-010` 鎺ヤ笅鏉ユ渶鍊煎緱缁х画鎺ㄨ繘鐨勬柟鍚戙€?
## 2026-07-09 03:46:30 +08:00 | v1.1.0-alpha.112 | 鎺ㄨ繘 FE-040 鍏变韩璁捐 token 鍗曚竴鏉ユ簮璧锋
### 浠诲姟鍐呭

- 寤剁画鏂扮殑蹇€熷師鍨嬫柟鍚戯紝缁х画鍥寸粫 `FE-040` 鍋氣€滃厛鎶婂叏灞€楠ㄦ灦鏀惰捣鏉モ€濈殑灏忔鎺ㄨ繘锛岃€屼笉鏄洖鍒板崟涓€鍐茬獊瀛愬満鏅繁鎸栥€?- 鏈疆鐩爣鏄湪涓嶅ぇ鏀圭幇鏈夐〉闈㈢粨鏋勭殑鍓嶆彁涓嬶紝鎶婄敤鎴风褰撳墠鐢熸晥鐨?UI-04 鏍?token 浠庨〉闈㈡牱寮忛噷鎶藉嚭鍒板叡浜寘锛屽缓绔嬫渶灏忓彲澶嶇敤鐨勫崟涓€鏉ユ簮銆?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/tokens.css`锛屾矇娣€鐢ㄦ埛绔綋鍓嶇敓鏁堢殑 `--bg-*`銆乣--surface*`銆乣--accent*`銆乣--radius-*`銆乣--sidebar-width`銆乣--panel-blur` 绛夋牴 token锛屽苟鍦?`packages/ui/package.json` 鏆撮湶 `./tokens.css` 瀵煎嚭鍏ュ彛銆?- 鏇存柊 `frontend-user/src/styles.css`锛屽厛瀵煎叆 `@studymate/ui/tokens.css`锛岃鐢ㄦ埛绔牱寮忓叆鍙ｆ樉寮忔帴鍏ュ叡浜?token 灞傘€?- 鏇存柊 `frontend-user/src/styles/app.css` 涓?`frontend-user/src/styles/ui-redesign.css`锛岀Щ闄ら噸澶嶇殑 `:root` token 瀹氫箟锛岄伩鍏嶅悓鍚嶅彉閲忕户缁緷璧栨牱寮忓姞杞介『搴忚鐩栥€?- 鏂板 `packages/ui/src/tokens.test.ts` 涓?`frontend-user/src/styles/tokenSource.test.ts`锛岄攣瀹氬叡浜?token 鏂囦欢瀛樺湪銆佺敤鎴风鍏ュ彛宸叉帴绾匡紝浠ュ強鏈湴鏍峰紡鏂囦欢涓嶅啀閲嶅澹版槑鏍稿績 token銆?- 涓轰簡璁╁墠绔祴璇曞湪绫诲瀷妫€鏌ヤ笌鏋勫缓閾句笂鍙紪璇戯紝琛ュ厖 `frontend-user/src/vite-env.d.ts` 涓?`frontend-user` 鐨?`@types/node` 寮€鍙戜緷璧栵紝鎶?Node 鏂囦欢璇诲彇鑳藉姏鏄惧紡闄愬畾鍒板墠绔祴璇曠幆澧冦€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 FE-040 浠庘€滈噸澶?token 寰呮敹鍙ｂ€濇帹杩涘埌鈥滃叡浜?token 宸茶捣姝ヨ惤鍦扳€濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
- GREEN锛歚npx vitest run packages/ui/src/tokens.test.ts frontend-user/src/styles/tokenSource.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `packages/ui` 鐜板湪涓嶅彧鎵挎帴鍏变韩椤甸潰鐘舵€佽涔夛紝涔熷紑濮嬫壙鎺ュ叡浜瑙?token锛屽悗缁户缁绠＄悊绔拰鏇村 primitives 鎺ヨ繖灞傚叡浜潵婧愮殑鎴愭湰鏄庢樉鏇翠綆銆?- 杩欎竴杞粛鍙畬鎴愪簡鐢ㄦ埛绔殑鍏变韩 token 鎺ョ嚎锛岀鐞嗙灏氭湭鎺ュ叆锛宍@studymate/ui` 涔熻繕娌℃湁褰㈡垚鏇村畬鏁寸殑鍩虹缁勪欢濂戠害锛涜繖浜涗粛鐒舵槸 `FE-040 / FE-041` 涓嬩竴姝ユ渶鍊煎緱缁х画鎺ㄨ繘鐨勬柟鍚戙€?
## 2026-07-09 03:34:30 +08:00 | v1.1.0-alpha.111 | 鎺ㄨ繘 FE-040 FE-041 鍏变韩椤甸潰鐘舵€佸绾﹁捣姝?### 浠诲姟鍐呭

- 鎸夋柊鐨勫揩閫熷師鍨嬫柟鍚戯紝浠庣户缁繁鎸?`WB-032` 鍒囧埌鏇村亸鍏ㄥ眬楠ㄦ灦琛ラ綈鐨勫伐浣滃寘锛屼紭鍏堝惎鍔?`FE-040 / FE-041`銆?- 鏈疆鐩爣鏄湪涓嶉噸鍐欑幇鏈夐〉闈㈢殑鍓嶆彁涓嬶紝鍏堣 `@studymate/ui` 鐪熸鎵挎帴涓€灞傛渶灏忓彲澶嶇敤鐨勯〉闈㈢姸鎬佽涔夊绾︼紝骞惰鐢ㄦ埛绔幇鏈?`DataState` 鐩存帴娑堣垂瀹冦€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/dataState.ts`锛屽鍑哄叡浜?`dataStateKinds`銆乣DataStateKind` 涓?`getDataStateLabel(...)`锛屽厛缁熶竴 Loading / Empty / Error / Unauthorized / Stale / Conflict 鍏被椤甸潰鐘舵€佽涔夈€?- 鏇存柊 `packages/ui/src/index.ts` 涓?`packages/ui/src/index.test.ts`锛岃 `@studymate/ui` 浠庘€滃彧瀵煎嚭鍖呭悕鈥濈殑鍗犱綅鍖呭崌绾т负甯︽渶灏忔祴璇曠殑鍏变韩濂戠害鍏ュ彛銆?- 鏇存柊 `frontend-user/src/design-system/primitives/DataState.tsx`锛岀Щ闄ゆ湰鍦扮姸鎬佹枃妗堝垎鏀紝鏀逛负鐩存帴璋冪敤 `@studymate/ui` 鐨勫叡浜?label helper銆?- 鏇存柊 `frontend-user/src/design-system/primitives/index.ts` 涓?`frontend-user/package.json`锛屾樉寮忛€忓嚭鍏变韩 `DataStateKind` 骞跺０鏄?`@studymate/ui` workspace 渚濊禆銆?- 鏇存柊 `frontend-user/src/design-system/primitives/DataState.test.tsx`锛岃ˉ榻?`conflict` 鐘舵€佸洖褰掞紝纭鐢ㄦ埛绔粍浠跺凡缁忔秷璐瑰叡浜涔夎€屼笉鏄户缁湰鍦板垎鍙夈€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-040 / FE-041` 浠庤鍒掓€佹帹杩涘埌宸插惎鍔ㄧ殑鍏变韩鐘舵€佸绾﹂鏋躲€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/index.test.ts frontend-user/src/design-system/primitives/DataState.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/index.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx`

### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪鑷冲皯宸茬粡鎵挎帴浜嗕竴灞傜湡瀹炲叡浜绾︼紝鍚庣画鍙互娌跨潃鍚屼竴璺緞缁х画鍚告敹 token銆乣Drawer`銆乣Inspector` 绛夊熀纭€ primitives锛岃€屼笉蹇呭啀浠庨〉闈㈤噷闆舵暎澶嶅埗鐘舵€佽涔夈€?- 杩欎竴杞繕娌℃湁澶勭悊 `app.css` 涓?`ui-redesign.css` 鐨?token 婕傜Щ锛屼篃娌℃湁璁╃鐞嗙寮€濮嬫秷璐硅繖灞傚叡浜绾︼紱杩欎簺浠嶇劧鏄?`FE-040 / FE-041` 鍚庣画鏇存湁浠峰€肩殑涓嬩竴姝ャ€?
## 2026-07-09 03:25:42 +08:00 | v1.1.0-alpha.110 | 鎺ㄨ繘 WB-032 闃绘柇鏄庣粏鏍囬鍙鍖栧瓙姝ラ
### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滈樆鏂憳瑕佸彲璇诲寲鈥濆啀琛ラ綈鍒伴樆鏂槑缁嗗垪琛ㄥ眰銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勨€滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濆尯鍧楅噷锛屼笉鍐嶈姣忔潯闂鏍囬鍋滅暀鍦?`edge-local` 杩欑被鍐呴儴 ID锛岃€屾槸鐩存帴鏄剧ず绫讳技鈥滆繛绾库€淟ocal edge鈥濃€濈殑鍙瀵硅薄鍚嶃€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionBlockingIssueTitle(...)`锛屼紭鍏堜粠闃绘柇 message 涓彁鍙?`鑺傜偣 / 杩炵嚎 / 鍒嗙粍` 鐨勫彲璇诲璞″悕锛涙彁鍙栦笉鍒版椂鎵嶅洖閫€鍒?`targetId` 鎴?`ruleType`銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛岃鈥滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濇槑缁嗗垪琛ㄥ鐢ㄨ繖灞傛爣棰?helper锛岃€屼笉鏄洿鎺ユ覆鏌?`targetId`銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛屽厛鐢?RED 閿佸畾鈥滄槑缁嗘爣棰樺簲灞曠ず鍙瀵硅薄鍚嶁€濓紝鍐嶉獙璇佺粍浠剁骇涓庨〉闈㈢骇璺緞鍧囧凡杞豢銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滈樆鏂憳瑕佷笌闃绘柇鏄庣粏鏍囬閮藉睍绀哄彲璇诲璞″悕鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`

### 鍚庣画褰卞搷

- 鍐茬獊鍗＄墖鐜板湪浠庢憳瑕佸埌鏄庣粏鏍囬閮藉敖閲忛伩鍏嶆毚闇插唴閮ㄥ璞?ID锛岀敤鎴峰湪棰勬鍜岄€愭潯澶勭悊涔嬮棿鍒囨崲鏃舵洿瀹规槗瀵逛笂鍚屼竴涓璞°€?- 鎸夋柊鐨勫揩閫熷師鍨嬫柟鍚戯紝鍚庣画鏇撮€傚悎鎶婄簿鍔涜浆鍚戝叏灞€楠ㄦ灦琛ラ綈锛岃€屼笉鏄户缁湪鍗曚竴鍐茬獊瀛愬満鏅噷娣辨寲銆?
## 2026-07-09 03:19:49 +08:00 | v1.1.0-alpha.109 | 鎺ㄨ繘 WB-032 鑺傜偣绾ч樆鏂腑鏂囧寲瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滈妫€闃绘柇鍙绾跨储鈥濊ˉ榻愬埌鑺傜偣绾ч樆鏂被鍨嬨€?- 鏈疆鐩爣鏄 `invalid_source_target` / `invalid_node_size` 杩欑被鑺傜偣绾у啿绐佺殑鑱斿姩鍙栬垗寤鸿鍜岄樆鏂?message 閮戒娇鐢ㄤ腑鏂囪鏄庯紝閬垮厤鍐茬獊鍗＄墖閲屽悓涓€缁勯妫€涓€鍗婁腑鏂囥€佷竴鍗婅嫳鏂囥€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屽皢鑺傜偣鏉ユ簮涓嶅畬鏁淬€佽妭鐐瑰昂瀵搁潪娉曚袱绫婚樆鏂殑 `keep-latest` 寤鸿鏂囨鏀逛负涓枃銆?- 鍚屾灏?`validateGraphConflictResolutionDrafts(...)` 浜у嚭鐨勮妭鐐圭骇闃绘柇 message 鏀逛负涓枃锛屼緥濡傗€滆妭鐐光€淏roken source node鈥濈殑鏉ユ簮淇℃伅涓嶅畬鏁达紝璇疯ˉ榻?source.type/source.id 鎴栨敼涓轰繚鐣欐湇鍔＄銆傗€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛屽厛鐢?RED 閿佸畾鑻辨枃鏂囨闂锛屽啀楠岃瘉寤鸿鏂囨涓庨樆鏂?message 鍧囧凡涓枃鍖栥€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滆妭鐐圭骇闃绘柇涔熺撼鍏ヤ腑鏂囬妫€璇█鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐨勮妭鐐圭骇闃绘柇鐜板湪鍜岃竟/鍒嗙粍渚濊禆闃绘柇浣跨敤鍚屼竴濂椾腑鏂囪〃杈撅紝鎵归噺寤鸿銆侀妫€鎽樿鍜屾槑缁?message 鏇翠竴鑷淬€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸鏇村 error 绾у啿绐佺撼鍏ュ彲鎵ц寤鸿锛屾垨寮€濮嬫⒊鐞?`WB-034` 鎵€闇€鐨勫浘璋卞啿绐佸洖褰掔煩闃点€?
## 2026-07-09 03:14:25 +08:00 | v1.1.0-alpha.108 | 鎺ㄨ繘 WB-032 棰勬闃绘柇鍙绾跨储瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滈妫€浠ｈ〃瀵硅薄绀轰緥鈥濆啀琛ヤ竴灞傞樆鏂彲璇绘€с€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勯樆鏂憳瑕併€佸簲鐢ㄥ墠棰勬鍜屾壒閲忚仈鍔ㄥ彇鑸嶅弽棣堥噷锛屼笉鍐嶅彧鏄剧ず `edge-local` 杩欑被鍐呴儴瀵硅薄 ID锛岃€屾槸浼樺厛灞曠ず鈥滃摢涓璞″洜浠€涔堝師鍥犻樆鏂€濈殑鐭嚎绱€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛岃 `buildGraphConflictResolutionBlockingIssueSummary(...)` 浼樺厛浣跨敤鏍￠獙鍣ㄧ敓鎴愮殑鍙 message锛屽苟鍘嬬缉鎴愰涓師鍥犵煭鍙ワ紱褰?message 鍙槸娉涘寲鐭爜鏃朵粛鍥為€€鍒?`targetId` 鎴?`ruleType`銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岀敤 RED -> GREEN 閿佸畾鎵归噺鑱斿姩鍙嶉銆佸簲鐢ㄥ墠棰勬鍜岄樆鏂憳瑕侀兘浼氬睍绀虹被浼尖€滆繛绾库€淟ocal edge鈥濅細寮曠敤鏈繚鐣欑殑鑺傜偣鈥濈殑瀵硅薄绾х煭鍘熷洜銆?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岄攣瀹氱湡瀹炲伐浣滃尯閲屸€滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濅細灞曠ず鍙闃绘柇绾跨储锛岃€屼笉鏄８瀵硅薄 ID銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃簲鐢ㄥ墠棰勬鍜岄樆鏂憳瑕佷紭鍏堝睍绀哄彲璇诲璞″師鍥犫€濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪鑳藉湪鏈€缁堢偣鍑诲墠鐩存帴鎸囧嚭闃绘柇瀵硅薄鍜岄樆鏂師鍥狅紝鐢ㄦ埛涓嶉渶瑕佷粠鍐呴儴 ID 鍐嶅弽鎺ㄧ敾甯冨璞°€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸鏇村鍐茬獊绫诲瀷绾冲叆鍚屼竴濂楀璞＄骇鑱斿姩鍙栬垗绛栫暐锛屽苟缁х画鍑嗗 `WB-034` 鐨勫伐浣滃尯鍥炲綊鐭╅樀銆?
## 2026-07-09 02:05:19 +08:00 | v1.1.0-alpha.107 | 鎺ㄨ繘 WB-032 棰勬浠ｈ〃瀵硅薄绀轰緥瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滈妫€骞跺叆鏈爣璁伴粯璁ゅ洖閫€缁撴灉鈥濆啀琛ュ厖鎴愭洿瀹屾暣鐨勫悎骞跺墠棰勬鍙嶉銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勨€滃簲鐢ㄥ墠棰勬鈥濋噷锛岃鐢ㄦ埛涓嶅彧鐪嬪埌鍙栬垗鏁伴噺鍜屾湭鏍囪瀵硅薄鐨勯粯璁ゅ洖閫€缁撴灉锛岃繕鑳界洿鎺ョ湅鍒拌繖杞凡鏍囪鍙栬垗鐨勪唬琛ㄥ璞＄ず渚嬨€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屼负 `buildGraphConflictResolutionPreflightMessage(...)` 澧炲姞浠ｈ〃瀵硅薄绀轰緥鎽樿锛氫細鎸?`淇濈暀鏈湴 / 淇濈暀鏈嶅姟绔?/ 绋嶅悗澶勭悊` 鍚勮嚜鎶藉彇浠ｈ〃瀵硅薄锛岀敓鎴愮被浼尖€滀緥濡備繚鐣欐湰鍦帮細鏈湴鑺傜偣锛屼繚鐣欐湇鍔＄锛氭棫鍏崇郴鈥濈殑琛ュ厖璇存槑銆?- 淇濇寔杩欏眰绀轰緥鎽樿缁х画鍋滅暀鍦?helper 鍐呴儴缁勮锛屼笉鎶婇妫€鏍煎紡瑙勫垯鏁ｈ惤鍒版帶鍒跺櫒鎴栧啿绐佸崱鐗囩粍浠朵腑銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻?helper 绾т笌椤甸潰绾у洖褰掞紝閿佸畾鈥滃簲鐢ㄥ墠棰勬浼氬甫浠ｈ〃瀵硅薄绀轰緥鈥濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃簲鐢ㄥ墠棰勬鍚屾椂瑙ｉ噴鏁伴噺銆佷唬琛ㄥ璞′笌鏈爣璁伴粯璁ゅ洖閫€缁撴灉鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪鑳藉湪鏈€缁堢偣鍑诲墠锛屾妸鈥滄暟閲忕骇缁撴灉鈥濆拰鈥滆繖杞彇鑸嶄富瑕佽鐩栧摢浜涘璞♀€濅竴璧疯娓呮锛岃繘涓€姝ラ檷浣庡璞＄骇浜哄伐鍙栬垗鏃剁殑棰勬涓嶇‘瀹氭劅銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸杩欏眰鎽樿缁х画鎵╁睍鎴愭洿瀹屾暣鐨勫璞＄骇鍚堝苟棰勬鍙嶉锛屽苟瑕嗙洊鏇村鍐茬獊绫诲瀷鐨勮仈鍔ㄥ彇鑸嶇瓥鐣ャ€?
## 2026-07-09 02:00:43 +08:00 | v1.1.0-alpha.106 | 鎺ㄨ繘 WB-032 棰勬骞跺叆鏈爣璁伴粯璁ゅ洖閫€瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滃簲鐢ㄥ墠棰勬鎽樿鈥濆啀琛ュ畬鏁翠竴灞傘€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囬噷锛岃鈥滃鏋滅幇鍦ㄥ簲鐢ㄢ€濅笉鍙鏄庡凡鏍囪鍙栬垗浼氭€庝箞澶勭悊锛屼篃鐩存帴璇存槑杩樻湁鍝簺鏈爣璁板璞′細榛樿娌跨敤鏈€鏂板浘璋辩増鏈€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionUnmarkedSummary(...)`锛屾妸鏈爣璁板璞＄殑榛樿鍥為€€缁撴灉缁熶竴鍘嬫垚鍙鐢ㄦ憳瑕侊紝骞惰 `buildGraphConflictResolutionPreflightMessage(...)` 鏀寔鎶婅繖娈电粨鏋滃苟鍏ユ渶缁堥妫€鎻愮ず銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽熀浜庡綋鍓?`unsavedChangeDetails`銆乣latestHeadConflictDetails` 涓?`conflictResolutionSelections` 璁＄畻鏈爣璁板璞℃憳瑕侊紝鍐嶆妸瀹冧竴骞朵紶缁欑幇鏈夌殑 `resolutionPreflightMessage`銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻?helper 绾т笌椤甸潰绾у洖褰掞紝閿佸畾鈥滃簲鐢ㄥ墠棰勬浼氭妸鏈爣璁板璞￠粯璁ゆ部鐢ㄦ渶鏂扮増鏈殑缁撴灉涓€璧疯娓呮鈥濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃簲鐢ㄥ墠棰勬鍚屾椂瑙ｉ噴宸叉爣璁板彇鑸嶄笌鏈爣璁伴粯璁ゅ洖閫€缁撴灉鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪鑳藉湪鏈€缁堢偣鍑诲墠锛屾妸鈥滃凡鏍囪瀵硅薄浼氬浣曞悎骞垛€濆拰鈥滄湭鏍囪瀵硅薄浼氬浣曢粯璁ゅ洖閫€鈥濆悓鏃惰娓呮锛屽噺灏戠敤鎴峰湪瀵硅薄绾у彇鑸嶅満鏅噷鐨勫悎骞朵笉纭畾鎰熴€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸杩欏棰勬浠庢憳瑕佹墿灞曞埌鏇村畬鏁寸殑瀵硅薄绾у悎骞堕妫€鍙嶉锛屽苟瑕嗙洊鏇村鍐茬獊绫诲瀷鐨勮仈鍔ㄥ彇鑸嶇瓥鐣ャ€?
## 2026-07-09 01:41:18 +08:00 | v1.1.0-alpha.105 | 鎺ㄨ繘 WB-032 搴旂敤鍓嶉妫€鎽樿瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滄渶缁堥妫€闃绘柇鎽樿鈥濆啀寰€鍓嶈ˉ鎴愭洿瀹屾暣鐨勨€滃鏋滅幇鍦ㄥ簲鐢ㄤ細鍙戠敓浠€涔堚€濋妫€鎻愮ず銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛岃鐢ㄦ埛鍦ㄧ湡姝ｇ偣鍑烩€滃簲鐢ㄥ凡鏍囪鍙栬垗鍒板綋鍓嶈崏绋库€濆墠锛屽氨鑳界洿鎺ョ湅鍒颁竴鏉″悎骞跺墠棰勬鎽樿锛氭棦璇存槑褰撳墠璁″垝淇濈暀鍝簺鍙栬垗锛屼篃璇存槑鏄惁浼氳渚濊禆闂闃绘柇銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionPreflightMessage(...)`锛岀粺涓€鐢熸垚鍚堝苟鍓嶉妫€鎽樿锛氬綋瀛樺湪闃绘柇鏃讹紝浼氳鏄庘€滃凡鏍囪鍙栬垗浼氳 N 涓緷璧栭棶棰橀樆鏂紙鎽樿锛夆€濓紱褰撴棤闃绘柇鏃讹紝浼氳鏄庘€滃鏋滅幇鍦ㄥ簲鐢細淇濈暀鏈湴 X 椤?/ 淇濈暀鏈嶅姟绔?Y 椤?/ 绋嶅悗澶勭悊 Z 椤光€濄€?- 椤烘墜鎶婂彇鑸嶆暟閲忔眹鎬婚€昏緫鎶芥垚鍐呴儴澶嶇敤鐨?decision summary锛岄伩鍏嶇粨鏋滃弽棣堜笌棰勬鎽樿鍚勮嚜缁存姢涓€濂楄鏁拌鍒欍€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽熀浜庡綋鍓?`conflictResolutionDrafts` 涓?`conflictResolutionBlockingIssues` 璁＄畻 `resolutionPreflightMessage`锛屽苟浼犵粰鍐茬獊鍗＄墖銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屾柊澧炩€滃簲鐢ㄥ墠棰勬鈥濆尯鍧楋紝鍦ㄥ啿绐佸崱鐗囦腑鐩存帴灞曠ず杩欐潯棰勬鎽樿銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 涓?`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`锛岃ˉ榻?helper 涓庣粍浠剁骇鍥炲綊锛岄攣瀹氣€滃簲鐢ㄥ墠棰勬鈥濅細鍦ㄥ崱鐗囦腑鏄剧ず鐨勮涓恒€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃啿绐佸崱鐗囦細鐩存帴灞曠ず鍚堝苟鍓嶉妫€鎽樿鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氱粰鍑洪樆鏂憳瑕佸拰鎵归噺鍙栬垗鍙嶉锛岃繕浼氬湪鐪熸搴旂敤鍓嶇洿鎺ユ妸鈥滃鏋滅幇鍦ㄥ簲鐢ㄤ細鍙戠敓浠€涔堚€濇彁鍓嶈娓呮锛岀敤鎴蜂笉闇€瑕佺偣鍒版渶鍚庝竴姝ユ墠鐞嗚В褰撳墠鍙栬垗鐨勫悎骞剁粨鏋溿€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸杩欏眰棰勬缁х画鎵╁睍鎴愭洿瀹屾暣鐨勫悎骞堕妫€鍙嶉锛屽苟瑕嗙洊鏇村鍐茬獊绫诲瀷鐨勫璞¤仈鍔ㄧ瓥鐣ャ€?
## 2026-07-09 01:37:00 +08:00 | v1.1.0-alpha.104 | 鎺ㄨ繘 WB-032 鏈€缁堥妫€闃绘柇鎽樿瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滈樆鏂樊寮傝В閲娾€濆熀纭€涓婏紝鎶婅繖灞傛憳瑕佺户缁墠绉诲埌鐪熸搴旂敤鍙栬垗鍓嶇殑鏈€缁堥妫€鍗＄墖閲屻€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勨€滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濆尯鍧椾腑锛屼笉鍙垪鍑烘槑缁嗗垪琛紝杩樺厛缁欏嚭涓€鏉＄簿绠€鐨勯樆鏂憳瑕侊紱鍚屾椂璁╂渶缁堥妫€鍏滃簳鏂囨涔熷鐢ㄥ悓涓€濂楁憳瑕侊紝淇濊瘉鍐茬獊鍗＄墖鍜岀姸鎬佹彁绀哄鐢ㄦ埛璇寸殑鏄悓涓€浠朵簨銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鈥滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濆尯鍧楅《閮ㄦ柊澧炴憳瑕佹枃妗堬細浼氬厛鏄剧ず `褰撳墠浠嶉樆鏂細...銆傝鍏堣皟鏁存爣璁板悗鍐嶅簲鐢ㄣ€俙
- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃 `applyMarkedConflictResolutions()` 鍦ㄥ厹搴曢樆鏂彁绀洪噷涔熷鐢ㄥ悓涓€濂?`buildGraphConflictResolutionBlockingIssueSummary(...)`锛岄伩鍏嶆渶缁堥妫€鐨勬彁绀虹户缁仠鐣欏湪鍙湁娉涘寲鏂囨鐨勭姸鎬併€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻愮粍浠剁骇鍜岄〉闈㈢骇鍥炲綊锛岄攣瀹氣€滈樆鏂憳瑕佷細鐩存帴鏄剧ず鍦ㄦ渶缁堥妫€鍗＄墖閲屸€濈殑琛屼负銆?- 澶嶇敤骞跺洖褰?`frontend-user/src/modules/graph/lib/graphConflictSummary.ts` / `.test.ts` 閲岀殑闃绘柇鎽樿 helper锛岀‘淇濇憳瑕佹牸寮忎笌涓婁竴杞繚鎸佷竴鑷淬€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄渶缁堥妫€鍗＄墖涓庣姸鎬佸厹搴曞叡鐢ㄩ樆鏂憳瑕佲€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氬湪鎵归噺鍙栬垗鍙嶉閲岀粰鍑哄墿浣欓樆鏂璞℃憳瑕侊紝涔熶細鍦ㄧ湡姝ｅ簲鐢ㄥ彇鑸嶅墠鐨勬渶缁堥妫€鍗＄墖閲屽厛鎶婇樆鏂憳瑕佽娓呮锛屽噺灏戠敤鎴峰湪鈥滃垪琛ㄥ緢澶氫絾涓嶇煡閬撳厛鐪嬪摢椤光€濇椂鐨勫垽鏂垚鏈€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄妸杩欏鎽樿缁х画鎵╁睍鍒版渶缁堝簲鐢ㄥ墠鏇村畬鏁寸殑鍚堝苟棰勬鍙嶉锛屼互鍙婅鐩栨洿澶氬啿绐佺被鍨嬬殑瀵硅薄鑱斿姩绛栫暐銆?
## 2026-07-09 01:30:30 +08:00 | v1.1.0-alpha.103 | 鎺ㄨ繘 WB-032 闃绘柇宸紓瑙ｉ噴瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滄壒閲忓彇鑸嶅弽棣堣В閲娾€濆熀纭€涓婏紝鎶娾€滀粛鏈夐樆鏂€濊繖浠朵簨缁х画浠庡彧鏈夋暟閲忔彁绀烘帹杩涘埌鈥滅煡閬撹繕鍗″湪鍝簺瀵硅薄涓娾€濈殑鏇寸粏绮掑害瑙ｉ噴銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勬壒閲忚仈鍔ㄥ彇鑸嶅弽棣堜腑锛屽綋闃绘柇灏氭湭瀹屽叏瑙ｉ櫎鏃讹紝涓嶅彧鍛婅瘔鐢ㄦ埛鈥滆繕鍓╁嚑涓緷璧栭棶棰樷€濓紝杩樿缁欏嚭涓€娈电簿绠€鐨勫墿浣欓樆鏂璞℃憳瑕侊紝甯姪鐢ㄦ埛蹇€熷垽鏂笅涓€姝ヨ缁х画璋冨摢浜涘璞°€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionBlockingIssueSummary(...)`锛屾妸鍓╀綑闃绘柇瀵硅薄鍘嬬缉鎴愬彲澶嶇敤鐨勭煭鎽樿锛岄粯璁ゅ睍绀哄墠 2 涓?target锛屽苟鍦ㄨ秴鍑烘椂闄勫甫鎬绘暟銆?- 鏇存柊 `buildGraphConflictResolutionSuggestionOutcomeMessage(...)`锛屼粠鍙帴鏀堕樆鏂暟閲忔敼涓烘帴鏀跺畬鏁撮樆鏂垪琛紱褰撻樆鏂粛瀛樺湪鏃讹紝鍙嶉鏂囨鐜板湪浼氭樉寮忛檮甯︾被浼?`edge-local銆乬roup-local 绛?3 椤筦 鐨勫璞℃憳瑕併€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃鎵归噺鍙栬垗鍙嶉鏀逛负浼犲叆鈥滄壒閲忔爣璁板悗鐨勭湡瀹炲墿浣欓樆鏂垪琛ㄢ€濓紝鑰屼笉鏄彧浼犳暟瀛椼€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岃ˉ榻?helper 绾у洖褰掞紝閿佸畾鈥滈樆鏂湭瑙ｉ櫎鏃朵細杩斿洖瀵硅薄鎽樿鈥濈殑琛屼负锛涘苟鍥炲綊 `frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx` 涓?`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`锛岀‘淇濆凡瑙ｉ櫎闃绘柇璺緞涓嶅洖閫€銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄壒閲忓彇鑸嶅弽棣堜細鎸囧嚭鍓╀綑闃绘柇瀵硅薄鎽樿鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氬憡璇夌敤鎴封€滆繕鍓╁嚑涓樆鏂€濓紝涔熶細鍦ㄦ壒閲忚仈鍔ㄥ彇鑸嶅悗缁欏嚭绮剧畝鐨勫墿浣欓樆鏂璞℃憳瑕侊紝璁╀笅涓€姝ヨ皟鏁寸洰鏍囨洿鏄庣‘銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ャ€佽鐩栨洿澶氬啿绐佺被鍨嬬殑鎵归噺鍙栬垗杈呭姪锛屼互鍙婃妸杩欑闃绘柇鎽樿杩涗竴姝ユ墿灞曞埌鐪熸搴旂敤鍙栬垗鍓嶇殑鏈€缁堥妫€鍙嶉銆?
## 2026-07-09 01:26:28 +08:00 | v1.1.0-alpha.102 | 鎺ㄨ繘 WB-032 鎵归噺鍙栬垗鍙嶉瑙ｉ噴瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滆仈鍔ㄥ彇鑸嶆壒閲忓簲鐢ㄢ€濆熀纭€涓婏紝鎶婃壒閲忔爣璁板悗鐨勭敤鎴峰弽棣堜粠鍥哄畾鎻愮ず缁х画鎺ㄨ繘鍒扳€滃甫缁撴灉鎽樿鍜岄妫€缁撹鈥濈殑鍙В閲婄姸鎬併€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛岀敤鎴风偣鍑?`涓€閿簲鐢?N 椤硅仈鍔ㄥ彇鑸嶅缓璁甡 鍚庯紝涓嶅彧鐭ラ亾鈥滃凡缁忔壒閲忔爣璁扳€濓紝杩樿绔嬪埢鐭ラ亾鏈鏍囪鍖呭惈澶氬皯鏈湴/鏈嶅姟绔彇鑸嶏紝浠ュ強褰撳墠鏄惁宸茬粡瑙ｉ櫎渚濊禆闃绘柇銆佽兘鍚︾户缁簲鐢ㄥ埌鏈€鏂?`head`銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionSuggestionOutcomeMessage(...)`锛岀粺涓€鐢熸垚鎵归噺鑱斿姩鍙栬垗鍚庣殑鍙嶉鏂囨锛氫細姹囨€绘湰娆℃爣璁颁腑鐨?`keep-local / keep-latest / review-later` 鏁伴噺锛屽苟鏍规嵁鍓╀綑闃绘柇鏁伴噺杩斿洖鈥滃凡瑙ｉ櫎渚濊禆闃绘柇锛屽彲缁х画搴旂敤鈥濇垨鈥滀粛鏈?N 涓緷璧栭棶棰樺緟澶勭悊鈥濈殑棰勬瑙ｉ噴銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽湪 `applyConflictResolutionSuggestions()` 涓敼涓哄熀浜庘€滄壒閲忔爣璁板悗鐨勪笅涓€缁?selections鈥濋噸鏂拌绠楀璞＄骇鍙栬垗鑽夌涓庝緷璧栨牎楠岀粨鏋滐紝鍐嶄娇鐢ㄦ柊 helper 鐢熸垚鍙嶉锛岃€屼笉鏄户缁娇鐢ㄥ浐瀹氭枃妗堛€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻?helper 涓庨〉闈㈢骇鍥炲綊锛岄攣瀹氣€滄壒閲忔爣璁板悗浼氳繑鍥炲甫璁℃暟鎽樿鐨勫弽棣堬紝骞跺湪闃绘柇瑙ｉ櫎鏃剁洿鎺ユ彁绀哄彲浠ョ户缁簲鐢ㄢ€濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄壒閲忔爣璁拌仈鍔ㄥ缓璁悗浼氳繑鍥炲甫棰勬缁撹鐨勭粨鏋滆В閲娾€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧鏀寔鈥滄暣缁勫缓璁壒閲忔爣璁扳€濓紝杩樹細鍦ㄦ壒閲忔爣璁板悗绔嬪嵆鍛婅瘔鐢ㄦ埛杩欐鍒板簳鏍囪浜嗗摢浜涘彇鑸嶆柟鍚戯紝浠ュ強褰撳墠鏄惁宸茬粡瑙ｉ櫎闃绘柇銆佸彲浠ョ户缁簲鐢紝鍑忓皯鐢ㄦ埛鍦ㄥ啿绐佹€侀噷鍙嶅璇曠偣鎸夐挳鐨勮瘯鎺㈡垚鏈€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ャ€佽鐩栨洿澶氬啿绐佺被鍨嬬殑鎵归噺鍙栬垗杈呭姪锛屼互鍙婃洿缁嗙矑搴︾殑闃绘柇宸紓瑙ｉ噴銆?
## 2026-07-08 19:07:41 +08:00 | v1.1.0-alpha.101 | 鎺ㄨ繘 WB-032 鑱斿姩鍙栬垗鎵归噺搴旂敤瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滃悎骞剁粨鏋滃弽棣堚€濆拰鏇存棭鐨勨€滆仈鍔ㄥ彇鑸嶅缓璁€濆熀纭€涓婏紝鎶婂啿绐佸鐞嗙户缁粠鈥滃崟鏉″缓璁彲鐐瑰嚮鈥濇帹杩涘埌鈥滄暣缁勫缓璁彲鎵归噺钀芥垚鍙栬垗鏍囪鈥濄€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛屽綋鍚屼竴杞緷璧栭樆鏂敓鎴愬鏉¤仈鍔ㄥ缓璁椂锛岀敤鎴蜂笉蹇呴€愭潯鐐瑰嚮锛岃€屾槸鍙互鍏堜竴閿妸杩欑粍寤鸿鎵归噺鍐欏叆褰撳墠瀵硅薄绾у彇鑸嶏紝鍐嶅喅瀹氭槸鍚︾户缁簲鐢ㄥ埌鏈€鏂?head銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`applyGraphConflictResolutionSuggestions(...)`锛屾妸鑱斿姩寤鸿鎵归噺鍚堝苟杩涘綋鍓?`resolutionSelections`锛屽鐢ㄦ棦鏈夊璞＄骇 decision key锛岄伩鍏嶉〉闈㈠眰閲嶅鎷艰鍙栬垗閿€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`applyConflictResolutionSuggestions()`锛氬綋瀛樺湪鑱斿姩寤鸿鏃讹紝缁熶竴鎵归噺鍐欏叆瀵硅薄绾у彇鑸嶆爣璁般€佷繚鎸?dirty/浜哄伐鍚堝苟鎬侊紝骞惰繑鍥炩€滃凡鎵归噺鏍囪 N 鏉¤仈鍔ㄥ彇鑸嶅缓璁紝璇风户缁‘璁ゅ悗鍐嶅簲鐢ㄢ€濈殑鐘舵€佸弽棣堛€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鈥滆仈鍔ㄥ彇鑸嶅缓璁€濆尯鍧楁柊澧?`涓€閿簲鐢?N 椤硅仈鍔ㄥ彇鑸嶅缓璁甡 鎸夐挳锛岃鎵归噺鏍囪鍔ㄤ綔鍜岄€愭潯寤鸿鍔ㄤ綔鍏卞瓨銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻?helper銆佺粍浠朵笌椤甸潰绾у洖褰掞紝閿佸畾鈥滄壒閲忔爣璁板缓璁悗鍙竻闄や緷璧栭樆鏂苟缁х画搴旂敤宸叉爣璁板彇鑸嶁€濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滆仈鍔ㄥ缓璁棦鍙€愭潯鐐归€夛紝涔熷彲鏁寸粍鎵归噺鏍囪鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氬湪闃绘柇鍙戠敓鏃剁粰鍑衡€滆鎬庝箞淇€濈殑鑱斿姩寤鸿锛屼篃鏀寔鍏堟妸鏁寸粍寤鸿鎵归噺钀芥垚瀵硅薄绾у彇鑸嶆爣璁帮紝鏄庢樉鍑忓皯澶氭潯渚濊禆寤鸿鍦烘櫙涓嬬殑閲嶅鐐瑰嚮銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ャ€佽鐩栨洿澶氬啿绐佺被鍨嬬殑鎵归噺鍙栬垗杈呭姪锛屼互鍙娾€滄壒閲忔爣璁颁箣鍚庡啀搴旂敤鈥濈殑鏇存竻鏅扮粨鏋滃弽棣堜笌棰勬瑙ｉ噴銆?
## 2026-07-08 18:50:34 +08:00 | v1.1.0-alpha.100 | 鎺ㄨ繘 WB-032 鍚堝苟缁撴灉鍙嶉瀛愭楠?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滆妭鐐圭骇鍐茬獊寤鸿鈥濆熀纭€涓婏紝鎶娾€滃簲鐢ㄥ凡鏍囪鍙栬垗鈥濆悗鐨勭粨鏋滃弽棣堜粠鍥哄畾鎻愮ず缁х画鎺ㄨ繘鍒板彲瑙ｉ噴鐨勫悎骞剁粨鏋滄憳瑕併€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛岀敤鎴锋妸瀵硅薄绾у彇鑸嶅簲鐢ㄥ埌鏈€鏂?head 鍚庯紝绔嬪嵆鐭ラ亾杩欐鍚堝苟鑽夌閲屽埌搴曚繚鐣欎簡澶氬皯鏈湴瀵硅薄銆佹部鐢ㄤ簡澶氬皯鏈嶅姟绔璞★紝浠ュ強澶氬皯瀵硅薄琚爣璁颁负绋嶅悗澶勭悊銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionOutcomeMessage(...)`锛屾妸瀵硅薄绾у彇鑸嶈崏绋胯浆鎹负鍙鐨勫悎骞剁粨鏋滃弽棣堬紝瑕嗙洊 `keep-local`銆乣keep-latest` 涓?`review-later` 涓夌被鍐崇瓥銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽湪 `applyMarkedConflictResolutions()` 鎴愬姛鍚庢敼涓轰娇鐢ㄧ粨鏋滄憳瑕佹枃妗堬紝鑰屼笉鏄浐瀹氱殑鈥滃凡鐢熸垚鍚堝苟鑽夌鈥濇彁绀恒€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts` 涓?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ榻?helper 涓庨〉闈㈢骇鍥炲綊锛岄攣瀹氣€滃簲鐢ㄥ彇鑸嶅悗鏄剧ず甯﹁鏁扮殑鍚堝苟缁撴灉鍙嶉鈥濄€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇鍙栬垗搴旂敤鍚庝細杩斿洖鍙В閲婄殑缁撴灉鎽樿鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氬憡璇夌敤鎴封€滃凡缁忕敓鎴愬悎骞惰崏绋库€濓紝杩樹細鐩存帴璇存槑鏈鍚堝苟閲屼繚鐣欎簡澶氬皯鏈湴瀵硅薄銆佹部鐢ㄤ簡澶氬皯鏈嶅姟绔璞★紝浠ュ強鏄惁瀛樺湪鈥滅◢鍚庡鐞嗕絾宸叉部鐢ㄦ渶鏂扮増鏈€濈殑瀵硅薄锛岄檷浣庣敤鎴峰湪澶氱鍚堝苟鍚庣殑涓嶇‘瀹氭劅銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ワ紝浠ュ強瑕嗙洊鏇村鍐茬獊绫诲瀷鐨勬壒閲忓彇鑸嶈緟鍔╋紝璁╄繖濂楀绔啿绐佸鐞嗕粠鈥滃崟鏉″缓璁彲鐐瑰嚮鈥濈户缁帹杩涘埌鈥滄暣缁勫彇鑸嶆洿楂樻晥鈥濄€?
## 2026-07-08 18:45:24 +08:00 | v1.1.0-alpha.99 | 鎺ㄨ繘 WB-032 鑺傜偣绾у啿绐佸缓璁瓙姝ラ
### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滆仈鍔ㄥ彇鑸嶅缓璁€濆熀纭€涓婏紝鎶娾€滃彧鐭ラ亾鍝噷閿欎簡鈥濈户缁帹杩涘埌鈥滆妭鐐圭骇閿欒涔熺煡閬撲笅涓€姝ユ€庝箞鐐光€濄€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛屽綋瀵硅薄绾у彇鑸嶈Е鍙?`invalid_source_target` / `invalid_node_size` 闃绘柇鏃讹紝涔熺洿鎺ョ粰鍑哄彲鎵ц鐨勨€滀繚鐣欐湇鍔＄鈥濆缓璁紝閬垮厤鐢ㄦ埛鍋滅暀鍦ㄩ敊璇鏄庨噷鑷鐚滄祴涓嬩竴姝ャ€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾墿灞?`buildGraphConflictResolutionSuggestions(...)`锛氬綋鏈湴鑺傜偣鍥犳潵婧愪俊鎭笉瀹屾暣鎴栧昂瀵搁潪娉曡€岄樆鏂璞＄骇鍙栬垗鏃讹紝鐩存帴鐢熸垚 `keep-latest` 寤鸿锛涘悓鏃惰ˉ涓婃洿鏄庣‘鐨勯樆鏂鏄庢枃妗堛€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岃ˉ榻?`invalid_source_target` / `invalid_node_size` 涓ょ被鑺傜偣绾ч樆鏂殑 helper 鍥炲綊锛岄攣瀹氣€滀細鐢熸垚鍙墽琛屽缓璁€濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滀緷璧栫被闃绘柇涔嬪锛岃妭鐐圭骇缁撴瀯閿欒涔熻兘缁欏嚭鍙墽琛屽彇鑸嶅缓璁€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run typecheck`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氫负 dangling edge / invalid group node 鐢熸垚鑱斿姩寤鸿锛屼篃鑳藉湪鑺傜偣鏉ユ簮涓嶅畬鏁存垨鑺傜偣灏哄闈炴硶鏃剁洿鎺ュ缓璁€滄敼涓轰繚鐣欐湇鍔＄鈥濓紝鎶婃洿澶氶樆鏂被鍨嬭浆鎴愬彲鎵ц鍔ㄤ綔銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ャ€佹洿娓呮櫚鐨勫绔悎骞剁粨鏋滃弽棣堬紝浠ュ強瑕嗙洊鏇村鍐茬獊绫诲瀷鐨勬壒閲忓彇鑸嶈緟鍔┿€?
## 2026-07-08 13:41:12 +08:00 | v1.1.0-alpha.98 | 鏀跺彛 FE-010 FE-020 FE-030 UI-04 楠岃瘉
### 浠诲姟鍐呭

- 鎸?`CODEX_MASTER_PROMPT.md` 褰撳墠浼樺厛绾э紝鍏堜笉缁х画鎵╁睍鏂板姛鑳斤紝鑰屾槸鎶?FE-010銆丗E-020銆丗E-030 涓?UI-04 浠庘€滃疄鐜板畬鎴愬緟楠岃瘉鈥濇敹鍙ｅ埌鈥滃凡鍦ㄧ湡瀹炰緷璧栫幆澧冨畬鎴愬洖褰掆€濄€?- 琛ラ綈杩欐壒鍓嶇楠岃瘉閲屾渶鍚庣殑鑴嗗急鐐癸紝纭繚鐢ㄦ埛绔笌绠＄悊绔?smoke 涓嶅啀渚濊禆杩囨椂椤甸潰鏂囨鎴栨槗纰庨€夋嫨鍣ㄣ€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屼负鍚庡彴宸ヤ綔鍙板鑸寜閽ˉ `aria-label`銆乣aria-pressed` 鍜?`data-admin-view`锛岃鐢ㄦ埛娌荤悊绛夋ā鍧楀叿澶囩ǔ瀹氱殑鍙闂€т笌鑷姩鍖栧畾浣嶈涔夈€?- 閲嶅啓 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屾敼涓洪€氳繃 `[data-admin-view="users"]` 楠岃瘉 users 妯″潡鍔犺浇銆乣/api/v1/admin/users?limit=20` 璇锋眰涓?`Authorization: Bearer admin-token` 澶撮儴锛屼互鍙?`alice` 娓叉煋缁撴灉銆?- 閲嶅啓 `e2e/user-shell.spec.ts`銆乣e2e/v1-review-flow.spec.ts`銆乣e2e/v1-admin-governance.spec.ts`銆乣e2e/v1-graph-workspace.spec.ts`锛岃鏂█涓庡綋鍓嶅３灞傘€佸涔犲伐浣滃尯銆佸悗鍙版不鐞嗗拰鍥捐氨 CanvasLayout 浜や簰淇濇寔涓€鑷达紝骞舵樉寮忚鐩栧浘璋卞鍏ュけ璐ャ€佷繚瀛樼姸鎬併€佸巻鍙叉仮澶嶅け璐ョ瓑鐜扮姸銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/FE-00_ACCEPTANCE_CHECKLIST.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md`銆乣docs/design/UI_04_PRODUCT_REDESIGN.md` 涓?`CHANGELOG.md`锛屾妸 FE/UI 鐪熷疄楠岃瘉鏀跺彛鍐欏洖闀挎湡鏂囨。銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-admin run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/app/layouts/layoutPolicy.test.ts src/app/layouts/AppShell.test.tsx src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx` 閫氳繃锛? 涓枃浠跺叡 28 鏉℃祴璇曢€氳繃銆?- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts` 鍏堝洜鏃ч€夋嫨鍣ㄥけ鏁堣繘鍏?RED锛岃ˉ绋冲畾璇箟涓庢祴璇曞悗 GREEN 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run build:admin` 閫氳繃銆?- `npx playwright test e2e/user-shell.spec.ts e2e/v1-graph-workspace.spec.ts e2e/v1-review-flow.spec.ts e2e/v1-admin-governance.spec.ts` 閫氳繃锛? 鏉?smoke 鍏ㄩ儴閫氳繃銆?
### 鍚庣画褰卞搷

- FE-010銆丗E-020銆丗E-030 涓?UI-04 鐜板湪涓嶅啀渚濊禆鈥滀箣鍚庢湁瀹屾暣 npm 渚濊禆鏃跺啀楠岃瘉鈥濈殑鍙ｅご鍓嶆彁锛屽悗缁彲浠ユ妸娉ㄦ剰鍔涢泦涓洖 `WB-032` 鐨勫啿绐佸鐞嗘繁鍖栦笌 `WB-034` 鐨勫浘璋卞洖褰掔煩闃点€?- 杩欒疆涓昏鏀跺彛鐨勬槸鐪熷疄楠岃瘉鍊哄姟锛屼笉浠ｈ〃澶氬垎杈ㄧ巼鎴浘銆佽瑙夊鐓у綊妗ｆ垨鏇村ぇ鑼冨洿鍏ㄩ噺 E2E 宸插叏閮ㄥ畬鎴愶紱杩欎簺浠嶉€傚悎浣滀负鍚庣画鐙珛璐ㄩ噺宸ヤ綔鍖呮帹杩涖€?## 2026-07-08 12:54:17 +08:00 | v1.1.0-alpha.97 | 鎺ㄨ繘 WB-032 鑱斿姩鍙栬垗寤鸿瀛愭楠?
### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滄湭鏍囪瀵硅薄鎻愮ず鈥濆熀纭€涓婏紝鎶婁緷璧栭樆鏂粠鈥滃彧鍛婅瘔鐢ㄦ埛鍝噷閿欎簡鈥濈户缁帹杩涘埌鈥滃憡璇夌敤鎴蜂笅涓€姝ュ彲浠ユ€庝箞鐐光€濄€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛屽綋瀵硅薄绾у彇鑸嶈Е鍙?`dangling_edge` / `invalid_group_node` 闃绘柇鏃讹紝鐩存帴缁欏嚭鍙偣鍑荤殑鑱斿姩鍙栬垗寤鸿锛屽府鍔╃敤鎴疯ˉ榻愪緷璧栨垨鏀瑰洖淇濈暀鏈嶅姟绔€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictResolutionSuggestions(...)`锛氫細鏍规嵁闃绘柇闂銆佸綋鍓嶅浘璋辨枃妗ｃ€佸璞＄骇宸紓鏄庣粏鍜屽凡閫夊彇鑸嶏紝鑷姩鐢熸垚鈥滆仈鍔ㄤ繚鐣欐湰鍦颁緷璧栬妭鐐光€濇垨鈥滄敼涓轰繚鐣欐湇鍔＄鈥濈殑寤鸿銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`conflictResolutionSuggestions` 璁＄畻骞朵紶鍏ュ啿绐佸崱鐗囷紱鏌ユ壘闈㈠悓鏃惰鐩栨湰鍦板樊寮傚拰 latest-head 宸紓锛岄伩鍏嶆仮澶嶈崏绋垮満鏅笅鐨勮仈鍔ㄥ缓璁紡鎺夊璞°€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鈥滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濆悗杩藉姞鈥滆仈鍔ㄥ彇鑸嶅缓璁€濆尯鍧楋紝鍏佽鐢ㄦ埛鐩存帴鐐瑰嚮蹇嵎鍔ㄤ綔锛屾妸寤鸿杞垚姝ｅ紡鐨勫璞＄骇鍙栬垗鏍囪銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`锛岃ˉ榻?helper銆佺粍浠朵笌椤甸潰绾у洖褰掞紝閿佸畾鈥滈樆鏂嚭鐜版椂鏈夊缓璁€佺偣鍑诲缓璁悗闃绘柇鍙В闄も€濈殑琛屼负銆?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇渚濊禆闃绘柇鏃佸彲鐩存帴琛ラ綈鑱斿姩鍙栬垗鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧浼氬湪瀵硅薄绾у彇鑸嶆棤鏁堟椂闃绘柇搴旂敤锛岃繕鑳界洿鎺ユ妸鈥滆琛ュ摢浜涜妭鐐光€濇垨鈥滆鎶婂摢涓璞℃敼鍥炴湇鍔＄鈥濊浆鎴愬彲鐐瑰嚮鍔ㄤ綔锛屽噺灏戠敤鎴峰湪鍐茬獊鍒楄〃鍜屼緷璧栧叧绯讳箣闂存潵鍥炲垏鎹€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿绯荤粺鐨勫绔?conflict handling锛屼緥濡傛洿瀹屾暣鐨勫璞¤仈鍔ㄧ瓥鐣ャ€佹洿澶氬啿绐佺被鍨嬬殑鍙墽琛屽缓璁紝浠ュ強鏇存竻鏅扮殑澶氱鍚堝苟缁撴灉鍙嶉銆?
## 2026-07-08 12:33:39 +08:00 | v1.1.0-alpha.96 | 鎺ㄨ繘 WB-032 鏈爣璁板璞℃彁绀哄瓙姝ラ

### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滃璞＄骇鍙栬垗渚濊禆鏍￠獙鈥濆熀纭€涓婏紝鎶娾€滈儴鍒嗗璞″凡鏍囪銆侀儴鍒嗗璞″皻鏈爣璁扳€濊繖涓€鐪熷疄楂橀鍦烘櫙瑙ｉ噴娓呮銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛屾槑纭彁绀鸿繕鏈夊灏戝璞″皻鏈爣璁板彇鑸嶏紝骞跺憡璇夌敤鎴峰鏋滅幇鍦ㄧ洿鎺ュ簲鐢紝杩欎簺瀵硅薄浼氶粯璁ゆ部鐢ㄦ渶鏂板浘璋辩増鏈紝鑰屼笉鏄潤榛樹繚鐣欐湰鍦拌崏绋裤€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屾柊澧炴湭鏍囪瀵硅薄缁熻涓庢彁绀哄尯鍧楋細鍐茬獊鍗＄墖浼氭眹鎬诲綋鍓嶄粛鏈爣璁扮殑鏈湴/鏈€鏂?head 瀵硅薄锛屽睍绀烘暟閲忋€佸垪鍑轰唬琛ㄩ」锛屽苟鏄庣‘璇存槑鐩存帴搴旂敤鏃剁殑榛樿琛屼负銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾妸浜哄伐鍚堝苟娓呭崟涓殑瀵硅薄绾у彇鑸嶈鏄庢敼涓烘樉寮忓０鏄庘€滄湭鏍囪椤瑰鏋滅洿鎺ュ簲鐢紝浼氶粯璁ゆ部鐢ㄦ渶鏂板浘璋辩増鏈€濓紝璁╅〉闈㈡彁绀恒€丮arkdown 鎽樿鍜屽啿绐佸鐞嗗寘淇濇寔涓€鑷淬€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`銆乣frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 涓?`frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岃ˉ榻愮粍浠剁骇銆侀〉闈㈢骇涓庡鍑虹墿绾у洖褰掞紝閿佸畾鏈爣璁板璞℃暟閲忔彁绀哄拰榛樿琛屼负鏂囨銆?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇鍙栬垗榛樿琛屼负鍙鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶄粎鑳介樆鏂槑鏄鹃敊璇殑瀵硅薄绾у悎骞讹紝杩樿兘鎶娾€滄湭鏍囪瀵硅薄浼氭€庝箞澶勭悊鈥濇彁鍓嶈娓呮锛屽噺灏戠敤鎴疯浠ヤ负鏈爣璁伴」浼氫繚鐣欐湰鍦扮殑椋庨櫓銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勮法瀵硅薄鑱斿姩鍙栬垗杈呭姪锛屼互鍙婃洿绯荤粺鐨勫绔?conflict handling銆?
## 2026-07-08 02:50:42 +08:00 | v1.1.0-alpha.95 | 鎺ㄨ繘 WB-032 瀵硅薄绾у彇鑸嶄緷璧栨牎楠屽瓙姝ラ

### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪涓婁竴杞€滃璞＄骇鍙栬垗鍙樉寮忓簲鐢ㄢ€濅负鍩虹涓婏紝琛ヤ笂鐪熸鑳介槻姝㈤敊璇悎骞惰崏绋胯惤鍦扮殑鏈€灏忎緷璧栨牎楠屻€?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑锛屽綋鐢ㄦ埛鍙繚鐣欎簡渚濊禆缂哄け鐨勬湰鍦拌繛绾挎垨鍒嗙粍鏃讹紝鑳藉鍦ㄥ簲鐢ㄥ墠鐩存帴闃绘柇锛屽苟鏄庣‘鍛婅瘔鐢ㄦ埛杩樼己鍝簺璺ㄥ璞′緷璧栥€?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`validateGraphConflictResolutionDrafts(...)`锛氬湪鎶婂璞＄骇鍙栬垗鑽夌 rebased 鍒版渶鏂?head 鍚庯紝澶嶇敤 `@studymate/graph-core` 鏍￠獙 dangling edge / invalid group node 绛夌粨鏋勯敊璇紝骞惰繃婊ゆ帀鏈€鏂?head 鏈韩宸插瓨鍦ㄧ殑闂銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽湪 `applyMarkedConflictResolutions()` 鍓嶆帴鍏ヤ緷璧栨牎楠岋紱鑻ュ綋鍓嶅彇鑸嶄細鐣欎笅璺ㄥ璞′緷璧栭棶棰橈紝鍒欎繚鎸佸啿绐佹€併€侀樆鏂簲鐢ㄥ苟缁欏嚭鏄庣‘鐘舵€佹彁绀恒€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鍐茬獊杈呭姪鍗＄墖涓柊澧炩€滃彇鑸嶄緷璧栨牎楠岄棶棰樷€濆尯鍧楋紝鍒楀嚭闃绘柇闂锛屽苟鍦ㄥ瓨鍦ㄩ棶棰樻椂绂佺敤 `搴旂敤宸叉爣璁板彇鑸嶅埌褰撳墠鑽夌`銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`銆乣frontend-user/src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ榻?helper銆佺粍浠朵笌椤甸潰绾у洖褰掞紝閿佸畾鈥滀緷璧栫己澶辨椂闃绘柇搴旂敤銆佹樉绀洪棶棰樿鏄庛€佹棦鏈夊啿绐佽矾寰勪粛鍙户缁伐浣溾€濈殑琛屼负銆?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇鍙栬垗鍙樉寮忓簲鐢紝涓斿甫鏈€灏忚法瀵硅薄渚濊禆鏍￠獙鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/GraphWorkspaceConflictResolutionDependencies.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶄細鍐嶆妸鏄庢樉涓嶅畬鏁寸殑瀵硅薄绾у彇鑸嶇洿鎺ヨ惤鎴愬彲淇濆瓨鑽夌锛涚敤鎴峰鏋滃彧淇濈暀浜嗕緷璧栫己澶辩殑鏈湴杩炵嚎鎴栧垎缁勶紝浼氬湪搴旂敤鍓嶅氨琚嫤涓嬪苟寰楀埌鍏蜂綋璇存槑銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄湭鏍囪瀵硅薄鐨勬洿寮烘彁绀恒€佹洿瀹屾暣鐨勮法瀵硅薄鑱斿姩鍙栬垗杈呭姪锛屼互鍙婃洿绯荤粺鐨勫绔?conflict handling銆?
## 2026-07-07 21:27:40 +08:00 | v1.1.0-alpha.94 | 鎺ㄨ繘 WB-032 瀵硅薄绾у彇鑸嶆樉寮忓簲鐢ㄥ瓙姝ラ

### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滃璞＄骇鍐茬獊鍙栬垗鑽夌鈥濈户缁帹杩涗负鐪熸鍙墽琛岀殑鏈湴鍚堝苟鍔ㄤ綔銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑鍏佽鐢ㄦ埛灏嗗凡鏍囪鐨?`淇濈暀鏈湴 / 淇濈暀鏈嶅姟绔?/ 绋嶅悗澶勭悊` 鑽夌鏄惧紡搴旂敤鍒版渶鏂?head 涔嬩笂锛岀敓鎴愪竴浠戒粛淇濇寔 dirty銆佷絾宸茬粡瀵归綈鏈€鏂扮増鏈彿鐨勫彲淇濆瓨鍚堝苟鑽夌銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`applyGraphConflictResolutionDrafts(...)` 绾嚱鏁帮細浠ユ渶鏂板浘璋?head 涓虹増鏈熀绾匡紝淇濈暀褰撳墠鏈湴鏍囬/璇存槑/瑙嗗彛锛屽苟鎶婂凡鏍囪涓?`淇濈暀鏈湴` 鐨勮妭鐐广€佽繛绾裤€佸垎缁勫璞¤鐩栧洖鍚堝苟鑽夌銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`applyMarkedConflictResolutions()`锛氭樉寮忓簲鐢ㄥ璞＄骇鍙栬垗鍚庯紝浼氭妸宸ヤ綔鍖哄垏鍒?rebased draft銆佸皢鍩虹嚎鎺ㄨ繘鍒版渶鏂?head銆佹竻鐞嗗啿绐佹€佸苟淇濇寔鑽夌鍙户缁繚瀛樸€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鍐茬獊杈呭姪鍗＄墖涓柊澧?`搴旂敤宸叉爣璁板彇鑸嶅埌褰撳墠鑽夌` 鍔ㄤ綔鎸夐挳锛屼粎鍦ㄥ凡鎷垮埌鏈€鏂?head 涓旇嚦灏戝瓨鍦ㄤ竴鏉″彇鑸嶈崏绋挎椂鍙敤銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ榻愮函鍑芥暟銆佸崱鐗囧姩浣滀笌鈥滃啿绐佸悗搴旂敤鍙栬垗鍐嶄繚瀛樷€濈殑椤甸潰绾у洖褰掋€?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇鍙栬垗鑽夌鍙樉寮忓簲鐢ㄧ敓鎴愬悎骞惰崏绋库€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪宸茬粡涓嶅彧浼氳褰曞璞＄骇鍙栬垗鎰忓浘锛岃繕鑳芥妸杩欎簺鍙栬垗鏄惧紡搴旂敤鍒版渶鏂?head 涓婏紝鐢熸垚涓€浠藉彲缁х画淇濆瓨鐨勫悎骞惰崏绋匡紝閬垮厤鐢ㄦ埛鍙兘瀵煎嚭鏉愭枡鍚庡洖鍒板閮ㄦ墜宸ユ暣鐞嗐€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄湭鏍囪瀵硅薄鐨勬洿寮烘彁绀恒€佽法瀵硅薄渚濊禆鐨勫啿绐佹牎楠岋紝浠ュ強鏇村畬鏁寸殑澶氱鑷姩/鍗婅嚜鍔ㄥ悎骞剁瓥鐣ャ€?
## 2026-07-07 21:13:40 +08:00 | v1.1.0-alpha.93 | 鎺ㄨ繘 WB-032 瀵硅薄绾у啿绐佸彇鑸嶈崏绋垮瓙姝ラ

### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸涓婁竴杞€滃璞＄骇鍐茬獊鏄庣粏鈥濈户缁帹杩涗负鍙搷浣滅殑浜哄伐鍚堝苟鍓嶇疆鑽夌銆?- 鏈疆鐩爣鏄湪鍥捐氨 Inspector 鐨勫啿绐佸崱鐗囦腑鍏佽鐢ㄦ埛瀵硅妭鐐?/ 杩炵嚎 / 鍒嗙粍绾у璞″厛鏍囪鈥滀繚鐣欐湰鍦?/ 淇濈暀鏈嶅姟绔?/ 绋嶅悗澶勭悊鈥濓紝骞舵妸杩欎簺鍙栬垗鑽夌甯﹀叆鍐茬獊鎽樿涓庡啿绐佸鐞嗗寘銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧炲璞＄骇鍙栬垗鑽夌妯″瀷銆佸喅绛?key銆乣resolutionDraft` 瀵煎嚭瀛楁锛屼互鍙婂啿绐佹憳瑕佷腑鐨勨€滃綋鍓嶄汉宸ュ彇鑸嶈崏绋库€濇钀姐€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`conflictResolutionSelections` 鐘舵€佸拰 `handleConflictResolutionChoice(...)` 浜や簰锛涘璞＄骇鍙栬垗涓€鏃︽爣璁帮紝浼氱粰鍑烘樉寮忕姸鎬佹彁绀哄苟杩涘叆鍐茬獊鎽樿 / 澶勭悊鍖呭鍑洪摼璺€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屼负姣忔潯瀵硅薄绾у啿绐佹槑缁嗚ˉ涓?`淇濈暀鏈湴 / 淇濈暀鏈嶅姟绔?/ 绋嶅悗澶勭悊` 鎸夐挳锛屽苟鏄剧ず褰撳墠閫夋嫨鐘舵€併€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ榻愬璞＄骇鍙栬垗鑽夌鍦?helper銆佺粍浠跺拰椤甸潰绾у啿绐佹祦涓殑鍥炲綊銆?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃璞＄骇鏄庣粏 + 瀵硅薄绾у彇鑸嶈崏绋库€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪宸茬粡涓嶅彧浼氬垪鍑哄璞★紝杩樿兘鎻愬墠璁板綍瀵硅薄绾т繚鐣?/ 鑸嶅純鎰忓浘锛屼负鐪熸鐨勮妭鐐圭骇 / 杈圭骇浜哄伐鍚堝苟娴佺▼鎻愪緵浜嗙涓€灞傜姸鎬佹ā鍨嬨€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄熀浜庤繖浜涘璞＄骇鍙栬垗鑽夌鐨勬樉寮忓簲鐢ㄦ祦绋嬶紝浠ュ強鏇村己鐨勫绔?conflict handling銆?
## 2026-07-07 21:02:14 +08:00 | v1.1.0-alpha.92 | 鎺ㄨ繘 WB-032 瀵硅薄绾у啿绐佹槑缁嗗瓙姝ラ

### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸宸叉湁鐨勨€滄憳瑕佺骇鍐茬獊鎻愮ず + 浜哄伐鍚堝苟娓呭崟鈥濈户缁笅娌変竴灞傘€?- 鏈疆鐩爣鏄湪鏂板浘璋?Inspector 鐨勫啿绐佸崱鐗囥€丮arkdown 鍐茬獊鎽樿鍜屽啿绐佸鐞嗗寘閲岋紝缁熶竴琛ヤ笂鑺傜偣 / 杩炵嚎 / 鍒嗙粍绾х殑瀵硅薄鏄庣粏锛岃鍚庣画浜哄伐鍚堝苟涓嶅啀鍙緷璧栨€婚噺鍜屽璞″悕鎽樿銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`unsavedChangeDetails` 涓?`latestHeadConflictDetails` 璁＄畻锛屽苟鎶婂璞＄骇宸紓鍚屾椂鎺ュ叆鍐茬獊鍗＄墖銆佸啿绐佹憳瑕佸鍑哄拰鍐茬獊澶勭悊鍖呭鍑洪摼璺€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛岃鍐茬獊杈呭姪鍗＄墖鏂板鈥滃缓璁紭鍏堟牳瀵圭殑瀵硅薄鈥濆尯鍧楋紝鎸夌粺涓€鏍煎紡灞曠ず `鑺傜偣锝滄柊澧烇綔...`銆乣杩炵嚎锝滃垹闄わ綔...`銆乣鍒嗙粍锝滀慨鏀癸綔...` 绛夊璞＄骇鏄庣粏銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ榻愬璞＄骇宸紓鏄庣粏鍦ㄦ憳瑕併€佸鐞嗗寘銆佺粍浠跺拰椤甸潰绾у啿绐佽矾寰勪腑鐨勫洖褰掓柇瑷€銆?- 鍚屾鏇存柊 `CHANGELOG.md`銆乣docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄憳瑕?+ 娓呭崟 + 瀵硅薄绾у啿绐佹槑缁嗏€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍥捐氨鍐茬獊杈呭姪鐜板湪宸茬粡涓嶅彧浼氬憡璇夌敤鎴封€滄敼浜嗗灏戙€佽鎬庝箞鍚堝苟鈥濓紝杩樹細鎶婄湡姝ｉ渶瑕佷紭鍏堟牳瀵圭殑鑺傜偣 / 杩炵嚎 / 鍒嗙粍瀵硅薄鐩存帴鍒楀嚭鏉ワ紝涓轰笅涓€姝ュ璞＄骇淇濈暀 / 鏀惧純鍙栬垗鍔ㄤ綔鎵撳簳銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄璞＄骇鍐茬獊鏄庣粏涓婄殑鏄惧紡淇濈暀 / 鑸嶅純鎿嶄綔锛屼互鍙婃洿寮虹殑澶氱 conflict handling銆?
## 2026-07-07 20:45:47 +08:00 | v1.1.0-alpha.91 | 鎺ㄨ繘 WB-032 浜哄伐鍚堝苟娓呭崟瀛愭楠?
### 浠诲姟鍐呭

- 缁х画鏀跺彛鍥捐氨鍐茬獊杈呭姪瀵煎嚭鐗╋紝璁┾€滃啿绐佹憳瑕佲€濆拰鈥滃啿绐佸鐞嗗寘鈥濋兘鑳界洿鎺ョ粰鍑哄彲鎵ц鐨勪汉宸ュ悎骞舵竻鍗曪紝鑰屼笉鍙仠鐣欏湪宸紓缃楀垪銆?
### 瀹為檯鍙樻洿

- 閲嶅啓 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾仮澶嶅共鍑€鐨勫啿绐佹憳瑕佸疄鐜帮紝骞朵负 Markdown 鍐茬獊鎽樿鏂板鈥滃缓璁殑浜哄伐鍚堝苟姝ラ鈥濇钀姐€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岃ˉ榻愪汉宸ュ悎骞舵竻鍗曞湪鎽樿涓庡鐞嗗寘涓殑瀵煎嚭鏂█銆?- 椤烘墜鎶?`frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 涓凡婕傜Щ鐨勬寜閽枃妗堟柇瑷€鏀逛负鏇寸ǔ鐨勮涔夊尮閰嶏紝閬垮厤鈥滀繚瀛樹慨鏀?/ 閲嶈浇鏈€鏂板浘璋扁€濇枃妗堝彉鍖栧鑷村浘璋卞洖褰掕鎶ャ€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx`
- `npm run verify:docs`

## 2026-07-02 10:00 | v1.1.0-alpha.90 | 鍓嶇 FE-03锛氶槄璇汇€佺瑪璁般€佸涔犲伐浣滃尯浣撻獙瀵归綈

### 浠诲姟鍐呭

- 鍦?FE-01 澶氬竷灞€澹冲眰鍜?FE-02 鍥捐氨 CanvasLayout 鐨勫熀纭€涓婏紝閲嶆瀯闃呰銆佺瑪璁颁笌澶嶄範椤甸潰鐨勭┖闂寸粨鏋勪笌淇℃伅鍒嗗眰銆?- 淇濇寔鐜版湁璧勬枡銆佹壒娉ㄣ€佺瑪璁般€佺増鏈€佸崱鐗囥€佸涔犲拰 AI 鑽夌鎺ュ彛鍙婃暟鎹绾︿笉鍙樸€?
### 瀹為檯鍙樻洿

- 闃呰鍣ㄥ崌绾т负 Studio 宸ヤ綔鍖猴細璧勬枡璧勬簮鍖恒€侀槄璇讳富鑸炲彴鍜屾壒娉?/ 涔︾ / 鑽夌 Inspector 鏀寔鎸夐渶灞曞紑銆?- 绗旇椤靛崌绾т负 Studio 宸ヤ綔鍖猴細绗旇璧勬簮鍖恒€佸瘜鏂囨湰缂栬緫鍣ㄥ拰鏉ユ簮 / 鍘嗗彶 / 澶嶄範 Inspector 鍒嗙銆?- 澶嶄範椤靛崌绾т负 Focus 宸ヤ綔鍖猴細鍗曚换鍔″崱鐗囪垶鍙般€侀敭鐩樼炕闈笌璇勫垎銆佸涔犺繘搴︺€佹寜闇€鍗＄粍绠＄悊銆?- 鏂板 `frontend-user/src/styles/studio-workspaces.css` 涓庨槄璇汇€佺瑪璁般€佸涔犻〉闈㈠洖褰掓祴璇曘€?- 琛ュ厖 FE-03 浜や粯璇存槑銆佸墠绔竷灞€璁捐鏂囨。銆佸緟鍔炵姸鎬佷笌鍙樻洿璁板綍銆?
### 楠岃瘉缁撴灉

- 宸插畬鎴愪慨鏀?TS/TSX 鏂囦欢鐨?TypeScript 璇硶杞瘧銆佹枃妗ｅ悓姝ャ€佺┖鐧藉瓧绗︿笌浜や粯鍖呭畬鏁存€ф鏌ャ€?- 褰撳墠鎵ц鐜缂哄皯瀹屾暣 npm 渚濊禆缂撳瓨锛岀被鍨嬫鏌ャ€乂itest銆乂ite 鏋勫缓鍜?Playwright 寰呭湪鏈満鎴?CI 鎵ц銆?
### 鍚庣画褰卞搷

- 鍚庣画 WB-032 鐨勮妭鐐圭骇 / 杈圭骇浜哄伐鍐茬獊鍚堝苟鐣岄潰灏嗘帴鍏ユ柊鐨勫浘璋?Inspector锛屼笉鍐嶅悜鏃т笁鏍忓伐浣滃尯鍫嗗彔鍗＄墖銆?
---

锘?# StudyMate 椤圭洰璁板綍

## 2026-07-02 16:41:18 +08:00 | v1.1.0-alpha.89 | 鍚姩鍓嶇甯冨眬閲嶆瀯 FE-00 / FE-01
### 浠诲姟鍐呭
- 鍩轰簬 `master@7b1e8f3a1e77dded69538d075758dc9529b31564`锛屽厛澶勭悊瀹為檯杩愯涓€滃浘璋辩敾甯冭閫氱敤涓夋爮澹冲眰鎸ゅ帇銆佸墠绔唴瀹规壙杞借惤鍚庡悗绔兘鍔涒€濈殑闂銆?- 涓嶈Е纰板浘璋?document銆佺増鏈€佸揩鐓с€佹潵婧?relation銆佸鍏ュ鍑哄拰 `409 graph_version_conflict` 濂戠害锛屽厛寤虹珛鍙壙鎺ュ悗缁浘璋遍噸鏋勭殑鍓嶇甯冨眬鍩虹銆?### 瀹屾垚缁撴灉
- 鏂板 FE-00 鍓嶇鑳藉姏鐭╅樀銆佸竷灞€閲嶆瀯瑙勬牸鍜岄獙鏀舵竻鍗曪紝鏄庣‘ Standard / Studio / Canvas / Focus 鍥涚被宸ヤ綔妯″紡鍙婂浘璋遍噸鏋勬柇鐐广€?- 鏂板 `frontend-user/src/app/layouts/AppShell.tsx` 涓?`layoutPolicy.ts`锛沗ShellFrame` 宸查檷涓鸿矾鐢卞吋瀹瑰眰銆?- 鍥捐氨鏀圭敤 Canvas 妯″紡銆侀槄璇?绗旇鏀圭敤 Studio 妯″紡銆佸涔犳敼鐢?Focus 妯″紡锛汣anvas / Focus 涓嶅啀娓叉煋閫氱敤 `ContextPanel`锛屽浘璋卞厛鏀跺洖鍏ㄥ眬鍙充晶鏍忕┖闂淬€?- 鏂板 `PrimaryNavigation`銆乣CompactNavigation`銆乣CommandBar`銆乣Drawer`銆乣Inspector`銆乣DataState` 鍙婄浉搴旂殑甯冨眬 / 缁勪欢鏈€灏忓洖褰掓祴璇曘€?- 鏂板 `styles/layouts.css`锛屽皢鏂扮殑甯冨眬鍙樹綋涓庡熀纭€鏋勪欢鏍峰紡浠庢棦鏈夊叏灞€鏍峰紡涓殧绂伙紝涓?FE-020 鍥捐氨 Drawer / Inspector 閲嶆瀯棰勭暀杈圭晫銆?### 楠岃瘉缁撴灉
- 宸茶繍琛?`git diff --check`锛屾湭鍙戠幇绌虹櫧閿欒锛涘苟浣跨敤鍏ㄥ眬 TypeScript 缂栬瘧鍣ㄨ繘琛屾柊澧?TS / TSX 鏂囦欢璇硶杞瘧妫€鏌ャ€?- 褰撳墠娌欑涓?`npm ci` 鍥?npm 闀滃儚 DNS `EAI_AGAIN` 鏈畬鎴愶紝灏氭湭鑳借繍琛岀敤鎴风 `typecheck`銆乂itest銆佹瀯寤哄拰 Playwright锛涢渶瑕佸湪姝ｅ父寮€鍙戞満鎴栧叿澶囦緷璧栫紦瀛樼殑 CI 鐜澶嶆牳銆?### 鍚庣画褰卞搷
- 鍥捐氨椤甸潰涓嶅啀鍙楀叏灞€ 336px ContextPanel 鐨勫浐瀹氭尋鍘嬶紝浣嗗唴閮?SourceRail / Inspector 浠嶆槸涓嬩竴姝?FE-020 鐨勬敼閫犵洰鏍囥€?- 鎺ヤ笅鏉ヤ紭鍏堝皢鍥捐氨宸︿晶璧勬簮鍖烘媶涓哄彲鍒囨崲 Drawer锛屽啀鎶婅妭鐐硅鎯呫€佸巻鍙层€佸啿绐佸拰 AI 鑽夌鏀跺彛杩涘彲鎶樺彔 Inspector銆?
> 璁板綍瑙勫垯锛氶」鐩富瑕佽瑷€涓烘眽璇€傛瘡瀹屾垚涓€涓嫭绔嬩换鍔★紝灏辨妸瀹屾暣缁撴灉杩藉姞鍒版湰鏂囨。寮€澶淬€傛瘡鏉¤褰曞繀椤诲寘鍚椂闂淬€侀」鐩増鏈紪鍙枫€佷换鍔″唴瀹广€佸畬鎴愮粨鏋溿€侀獙璇佺粨鏋滃拰鍚庣画褰卞搷銆?
## 2026-07-02 15:10:20 +08:00 | v1.1.0-alpha.88 | 鎺ㄨ繘 WB-032 寤跺悗浜哄伐鍚堝苟鐘舵€佹彁绀哄瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸褰撳墠鍐茬獊杈呭姪浠庘€滄潗鏂欏凡鐣欏瓨銆佸彲浠ュ畨鍏ㄩ噸杞解€濆啀鎺ㄨ繘涓€姝ャ€?- 鏈疆鐩爣鏄湪鐢ㄦ埛鍐冲畾杩欐鍏堜笉閲嶈浇鏃讹紝鎻愪緵鏄惧紡鐨勨€滃厛淇濈暀鏈湴锛岀◢鍚庝汉宸ュ悎骞垛€濆叆鍙ｅ拰鐘舵€佹彁绀猴紝璁┾€滅户缁繚鐣欐湰鍦拌崏绋库€濅篃鎴愪负鍙鍐崇瓥锛岃€屼笉鏄仠鐣欏湪闅愬惈鎿嶄綔銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽啿绐佽緟鍔╁崱鐗囨柊澧?`鍏堜繚鐣欐湰鍦帮紝绋嶅悗浜哄伐鍚堝苟` 鍔ㄤ綔锛屽苟鏀寔 `manualMergeDeferred` 鐘舵€佸睍绀?`宸叉爣璁颁负绋嶅悗浜哄伐鍚堝苟锛屽綋鍓嶇户缁繚鐣欐湰鍦拌崏绋縛銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`manualMergeDeferred` 鐘舵€佸拰 `deferManualMergeUntilLater()` 浜や簰锛涚敤鎴锋樉寮忛€夋嫨绋嶅悗浜哄伐鍚堝苟鍚庯紝浼氫繚鐣欏綋鍓?dirty 鑽夌鍜屽啿绐佽緟鍔╁崱鐗囷紝鍚屾椂缁欏嚭鍖归厤鐨勭姸鎬佹彁绀恒€?- 閲嶅啓骞惰ˉ寮?`frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`锛岄『鎵嬫竻鐞嗚鏂囦欢鐨勪贡鐮佹枃妗堬紝閿佸畾鍐茬獊鍗＄墖鍦ㄢ€滅◢鍚庝汉宸ュ悎骞垛€濊矾寰勪笅鐨勬寜閽€佹彁绀哄拰鍥炶皟銆?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岄攣瀹氶〉闈㈢骇鈥滃鍑哄啿绐佸鐞嗗寘 -> 鍏堜繚鐣欐湰鍦帮紝绋嶅悗浜哄伐鍚堝苟 -> 浠嶅彲绋嶅悗鍐嶉噸杞解€濈殑瀹屾暣璺緞銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滃畨鍏ㄩ噸杞芥彁绀?+ 寤跺悗浜哄伐鍚堝苟鎻愮ず鈥濆苟瀛樸€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧鏄湪鈥滄斁寮冩湰鍦板苟閲嶈浇鈥濊繖鏉¤矾寰勪笂鏇存槑纭紝涔熻兘鏄惧紡琛ㄨ揪鈥滆繖娆″厛淇濈暀鏈湴銆佺◢鍚庝汉宸ュ悎骞垛€濈殑鍐崇瓥鐘舵€侊紝璁╁啿绐佸鐞嗕粠鍗曚竴鍑哄彛鎺ㄨ繘鍒板弻璺緞鐘舵€佸寲銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿瀹屾暣鐨勫绔?conflict handling銆佸啿绐佸彇鑸嶆潗鏂欑粍缁囷紝浠ュ強鏇村己鐨勪汉宸ュ悎骞惰緟鍔┿€?
## 2026-07-02 01:08:10 +08:00 | v1.1.0-alpha.87 | 鎺ㄨ繘 WB-032 鍐茬獊鏉愭枡鐣欏瓨鐘舵€佹爣璁板瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸鍐茬獊澶勭疆浠庘€滆矾寰勬洿鏄庣‘鈥濆啀鎺ㄨ繘鍒扳€滅姸鎬佹洿鏄庣‘鈥濄€?- 鏈疆鐩爣鏄湪鐢ㄦ埛鎴愬姛澶嶅埗鎴栧鍑哄啿绐佹潗鏂欏悗锛屾樉寮忔彁绀衡€滃凡鐣欏瓨鍐茬獊鏉愭枡锛屽彲瀹夊叏閲嶈浇鏈€鏂板浘璋扁€濓紝璁╃敤鎴蜂笉鐢ㄥ啀鍑蹇嗗垽鏂嚜宸辨槸鍚﹀凡缁忕暀濂借瘉鎹€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`conflictArtifactsCaptured` 鐘舵€侊紱褰撳鍒?瀵煎嚭褰撳墠鑽夌 JSON銆佸啿绐佹憳瑕併€佹渶鏂板浘璋?JSON 鎴栧啿绐佸鐞嗗寘鎴愬姛鍚庯紝浼氱粺涓€鐐逛寒璇ョ姸鎬侊紱褰撳啿绐佹€佹秷澶辨椂浼氳嚜鍔ㄦ竻闆躲€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽啿绐佽緟鍔╁崱鐗囩幇鏀寔 `materialsCaptured`锛屽苟鍦ㄦ潗鏂欏凡鎴愬姛鐣欏瓨鏃舵樉绀?`宸茬暀瀛樺啿绐佹潗鏂欙紝鍙畨鍏ㄩ噸杞芥渶鏂板浘璋盽銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`GraphWorkspacePage.test.tsx`锛岄攣瀹氭潗鏂欏凡鐣欏瓨鏃剁殑鏄惧紡鎻愮ず涓庨〉闈㈢骇琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄潗鏂欑暀瀛?+ 鐣欏瓨鐘舵€佸彲瑙?+ 澶勭疆寮曞鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶄粎鍛婅瘔鐢ㄦ埛鈥滄€庝箞澶勭悊鈥濓紝杩樹細鍦ㄦ潗鏂欏凡缁忕暀瀛樺悗鏄惧紡鍛婅瘔鐢ㄦ埛鈥滃彲浠ュ畨鍏ㄩ噸杞解€濓紝璁╁啿绐佸喅绛栦粠闈欐€佽鏄庡彉鎴愬甫鐘舵€佹劅鐨勬祦绋嬨€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄€滀粎淇濈暀鏈湴浣嗘殏涓嶉噸杞解€濈殑涓撻棬寮曞锛屾垨鏇村畬鏁寸殑澶氱 conflict handling銆?
## 2026-07-02 01:03:10 +08:00 | v1.1.0-alpha.86 | 鎺ㄨ繘 WB-032 鍐茬獊澶勭疆寮曞瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸褰撳墠鍐茬獊杈呭姪浠庘€滄潗鏂欏噯澶囧厖鍒嗏€濈户缁帹杩涘埌鈥滃缃矾寰勬洿鏄庣‘鈥濄€?- 鏈疆鐩爣鏄湪鍐茬獊鍗＄墖閲岀洿鎺ュ憡璇夌敤鎴蜂笁绫诲吀鍨嬪喅绛栬矾寰勶紝骞舵妸鈥滄斁寮冩湰鍦板苟閲嶈浇鏈€鏂板浘璋扁€濈殑鍔ㄤ綔涓嬫矇鍒板崱鐗囨湰韬紝鍑忓皯鏉ュ洖瀵绘壘鍏ュ彛鐨勬垚鏈€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鍐茬獊杈呭姪鍗＄墖涓柊澧炰袱鏉℃樉寮忓紩瀵硷細
  - `濡傛灉纭鏀惧純鏈湴淇敼锛氬彲鐩存帴閲嶈浇鏈€鏂板浘璋盽
  - `濡傛灉鎵撶畻绋嶅悗浜哄伐鍚堝苟锛氬厛瀵煎嚭鍐茬獊澶勭悊鍖咃紝鍐嶉噸杞芥渶鏂板浘璋盽
- 鍚屾枃浠舵柊澧炲崱鐗囧唴鍔ㄤ綔 `鏀惧純鏈湴骞堕噸杞芥渶鏂板浘璋盽锛岃鐢ㄦ埛鍦ㄥ啿绐佺幇鍦哄氨鑳藉畬鎴愭渶鍚庝竴姝ワ紝鑰屼笉蹇呭啀鍥炲埌鐘舵€佹爮鎵惧叆鍙ｃ€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸鍗＄墖鍐呭姩浣滄帴鍒版棦鏈?`reloadLatestGraph()` 鍐崇瓥娴侊紝淇濇寔纭鏀惧純銆佹媺鍙栨渶鏂?head銆侀噸缃巻鍙插拰鐘舵€佹彁绀虹殑鍘熸湁琛屼负涓€鑷淬€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`GraphWorkspacePage.test.tsx`锛岄攣瀹氭樉寮忓缃枃妗堛€佸崱鐗囧唴閲嶈浇鎸夐挳鍜岄〉闈㈢骇纭娴佺▼銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄潗鏂欑暀瀛?+ 鏄惧紡澶勭疆寮曞 + 鍗＄墖鍐呴噸杞藉叆鍙ｂ€濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪宸茬粡涓嶅彧鏄湪鍚屼竴寮犲崱鐗囬噷鍫嗗姩浣滄寜閽紝鑰屾槸寮€濮嬫樉寮忚〃杈锯€滄斁寮冩湰鍦扳€濆拰鈥滅◢鍚庝汉宸ュ悎骞垛€濊繖涓ゆ潯鏈€甯歌鐨勫缃矾寰勶紝绂诲畬鏁村啿绐佽В鍐虫祦鏇磋繎涓€姝ャ€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄€滀繚鐣欐湰鍦板悗鏆備笉閲嶈浇鈥濈殑澶勭疆璇存槑銆佸鍑哄悗鐘舵€佹爣璁帮紝鎴栨洿瀹屾暣鐨勫绔?conflict handling銆?
## 2026-07-02 00:57:10 +08:00 | v1.1.0-alpha.85 | 鎺ㄨ繘 WB-032 鍐茬獊澶勭悊鍖呭鍑哄瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸鈥滅暀瀛樻潗鏂欌€濅粠鍒嗘暎鐨勫涓寜閽啀鎺ㄨ繘鎴愭洿鎺ヨ繎浜哄伐鍚堝苟鐨勫崟涓€瀵煎嚭鍏ュ彛銆?- 鏈疆鐩爣鏄湪 dirty 鍐茬獊鎬佷笅鎻愪緵 `瀵煎嚭鍐茬獊澶勭悊鍖卄锛屾妸鏈湴鑽夌 JSON銆佹湇鍔＄鏈€鏂板浘璋?JSON 鍜屽彲璇诲啿绐佹憳瑕佷竴璧锋墦鍖咃紝鍑忓皯鍚庣画浜哄伐姣斿鏃堕噸鏂版嫾鏉愭枡鐨勬垚鏈€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictBundleArtifact(...)`锛屾妸褰撳墠鍥捐氨鍏冧俊鎭€佹湰鍦拌崏绋挎憳瑕併€佹湰鍦拌崏绋?JSON銆佹渶鏂板浘璋?JSON 鍜屽啿绐佹憳瑕佹姤鍛婃敹鍙ｄ负鍗曚釜 JSON 鍖呫€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽綋鍐茬獊杈呭姪鍗＄墖宸叉嬁鍒版湇鍔＄鏈€鏂?head 鏃讹紝棰濆灞曠ず `瀵煎嚭鍐茬獊澶勭悊鍖卄銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`exportConflictBundle()`锛岀洿鎺ュ熀浜庡綋鍓嶅伐浣滃尯銆佹渶鏂?head 鍜屽啿绐佹憳瑕?artifact 瀵煎嚭鍗曚竴澶勭悊鍖咃紝骞朵繚鎸佸啿绐佸缓璁姸鎬佷笉琚竻鎺夈€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣GraphWorkspaceStageChrome.test.tsx` 鍜?`GraphWorkspacePage.test.tsx`锛岄攣瀹氬鐞嗗寘鏍煎紡銆佹寜閽嚭鐜版潯浠跺拰椤甸潰绾х姸鎬佸弽棣堛€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄湰鍦拌崏绋?JSON + 鏈€鏂板浘璋?JSON + 鍙鎽樿 + 鍗曟枃浠跺啿绐佸鐞嗗寘鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅彧鏄湪鍐茬獊鐜板満缁欏嚭鑻ュ共鈥滃鍒?瀵煎嚭鈥濇寜閽紝鑰屾槸宸茬粡鑳芥妸鍚庣画浜哄伐姣斿鏈€甯搁渶瑕佺殑涓夌被鏉愭枡鏀跺彛鎴愪竴涓鐞嗗寘锛屾槑鏄剧缉鐭€滃厛鐣欒瘉鎹€佸悗鍋氬喅绛栤€濈殑璺緞銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄槑纭殑鈥滀繚鐣欐湰鍦?/ 鏀惧純鏈湴 / 绋嶅悗浜哄伐鍚堝苟鈥濆缃紩瀵硷紝浠ュ強鏇村畬鏁寸殑澶氱 conflict handling銆?
## 2026-07-02 00:51:30 +08:00 | v1.1.0-alpha.84 | 鎺ㄨ繘 WB-032 鏈嶅姟绔渶鏂板浘璋?JSON 鐣欏瓨瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸鍐茬獊杈呭姪浠庘€滅暀瀛樻湰鍦拌崏绋库€濆拰鈥滃甫璧板彲璇绘憳瑕佲€濆啀寰€鍓嶆帹涓€姝ャ€?- 鏈疆鐩爣鏄湪 dirty 鍐茬獊鎬佷笅涔熻兘涓€閿甫璧扳€滄湇鍔＄鏈€鏂板浘璋?JSON鈥濓紝璁╃敤鎴峰悗缁仛浜哄伐姣斿銆佸閮?diff 鎴栧崐鎵嬪伐鍚堝苟鏃讹紝涓嶅繀鑷繁閲嶆柊鍘绘姄鏈€鏂?head銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛岃鍐茬獊杈呭姪鍗＄墖鍦ㄦ嬁鍒版渶鏂?head 鍚庨澶栨彁渚?`澶嶅埗鏈€鏂板浘璋?JSON` / `瀵煎嚭鏈€鏂板浘璋?JSON`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`copyLatestConflictJson()` 涓?`exportLatestConflictJson()`锛岀洿鎺ュ熀浜庡凡鎷夊彇鐨?`latestConflictDetail` 鏋勫缓 StudyMate JSON锛屽苟淇濇寔鍐茬獊寤鸿鐘舵€佷笉琚緟鍔╁姩浣滄竻鎺夈€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx` 涓?`GraphWorkspacePage.test.tsx`锛岄攣瀹氭渶鏂板浘璋?JSON 鐣欏瓨鎸夐挳鐨勫嚭鐜版潯浠躲€佷氦浜掑拰鐘舵€佸弽棣堛€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄湰鍦拌崏绋?JSON + 鍙鍐茬獊鎽樿 + 鏈€鏂板浘璋?JSON鈥濅笁杞ㄧ暀瀛樿緟鍔┿€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪宸茬粡鍙互鍚屾椂甯﹁蛋鈥滄湰鍦拌崏绋?JSON鈥濃€滄湇鍔＄鏈€鏂板浘璋?JSON鈥濆拰鈥滀汉绫诲彲璇绘憳瑕佲€濓紝杩欎负鍚庣画浜哄伐姣斿銆佸閮?diff 鍜屽悎骞跺彇鑸嶆彁渚涗簡鏇村畬鏁寸殑鍘熷鏉愭枡銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿鏄庣‘鐨勨€滀繚鐣欐湰鍦?/ 鏀惧純鏈湴 / 绋嶅悗浜哄伐鍚堝苟鈥濆缃紩瀵硷紝浠ュ強鏇村畬鏁寸殑澶氱 conflict handling銆?
## 2026-07-02 00:45:30 +08:00 | v1.1.0-alpha.83 | 鎺ㄨ繘 WB-032 鍙甫璧扮殑鍥捐氨鍐茬獊鎽樿瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滃叧閿璞″悕绾у啿绐佹憳瑕佲€濆熀纭€涓婏紝鍐嶈ˉ涓€灞傜湡姝ｅ彲甯﹁蛋鐨勫啿绐佸彇鑸嶄俊鎭€?- 鏈疆鐩爣鏄笉璁╃敤鎴峰湪鍐茬獊鐜板満鍙兘澶嶅埗鍘熷鑽夌 JSON锛岃€屾槸杩樿兘涓€閿鍒舵垨瀵煎嚭涓€浠戒汉绫诲彲璇荤殑鈥滃浘璋卞啿绐佹憳瑕佲€濓紝鏂逛究鍦ㄩ噸杞藉墠鍚屾缁欒嚜宸便€佸悓浜嬫垨鍚庣画浜哄伐鍚堝苟娴佺▼銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛屾柊澧?`buildGraphConflictReportArtifact(...)`锛屾妸褰撳墠鍥捐氨鏍囬銆佺増鏈€佸綋鍓嶆湭淇濆瓨淇敼鎽樿鍜屸€滀笌鏈€鏂板浘璋辩浉姣斺€濈殑宸紓鎽樿缁勮鎴愬彲澶嶅埗/瀵煎嚭鐨?Markdown 鎶ュ憡銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`copyConflictSummaryReport()` 涓?`exportConflictSummaryReport()`锛岃 dirty 鍐茬獊鎬佷笅鍙互鐩存帴澶嶅埗鎴栧鍑轰汉绫诲彲璇绘憳瑕侊紝骞朵繚鎸佲€滃缓璁噸杞芥渶鏂板浘璋扁€濈殑鍐茬獊鐘舵€佷笉琚緟鍔╁姩浣滄竻鎺夈€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屽湪鍐茬獊杈呭姪鍗＄墖閲屾柊澧?`澶嶅埗鍐茬獊鎽樿` / `瀵煎嚭鍐茬獊鎽樿` 鎸夐挳锛屾妸鈥滅暀瀛樺彲璇诲彇鑸嶄俊鎭€濆拰鈥滅暀瀛樺畬鏁?JSON 鑽夌鈥濇媶鎴愪袱鏉℃樉寮忚矾寰勩€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`銆乣GraphWorkspaceStageChrome.test.tsx`銆乣GraphWorkspacePage.test.tsx`锛岄攣瀹氭憳瑕佹姤鍛婃牸寮忋€佹寜閽氦浜掑拰椤甸潰绾х姸鎬佸弽棣堛€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鐨勫綋鍓嶈竟鐣屾帹杩涘埌鈥滃彲璇诲啿绐佹憳瑕?+ 鍘熷鑽夌 JSON 鍙岃建鐣欏瓨杈呭姪鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鐜板湪涓嶅啀鍙彁渚涒€滃畬鏁?JSON 鑽夌鐣欏瓨鈥濊繖涓€鏉″亸宸ョ▼鍖栫殑璺緞锛屼篃鑳界洿鎺ュ甫璧颁竴浠芥憳瑕佸寲銆佸彲娌熼€氱殑鍐茬獊鎶ュ憡锛岄檷浣庣敤鎴峰湪閲嶈浇鍓嶅仛鍒ゆ柇鍜屽悓姝ヤ笂涓嬫枃鐨勯棬妲涖€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿缁曗€滀繚鐣欐湰鍦?/ 鏀惧純鏈湴 / 鍚庣画浜哄伐鍚堝苟鈥濈殑鏇村己鍙栬垗杈呭姪锛屼互鍙婃洿瀹屾暣鐨勫绔?conflict handling銆?
## 2026-07-02 00:38:10 +08:00 | v1.1.0-alpha.82 | 鎺ㄨ繘 WB-032 鍏抽敭瀵硅薄鍚嶇骇鍐茬獊鎽樿瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滈潰鍚戞渶鏂?head 鐨勫啿绐佸樊寮傛憳瑕佲€濆熀纭€涓婏紝鍐嶆妸鎽樿绮掑害浠庘€滃彧鏈夋暟閲忊€濇帹杩涘埌鈥滄暟閲?+ 鍏抽敭瀵硅薄鍚嶁€濄€?- 鏈疆鐩爣鏄鐢ㄦ埛鍦ㄥ啿绐佸崱鐗囬噷涓嶅彧鐪嬪埌鈥滄柊澧?1 涓妭鐐光€濓紝鑰屾槸鑳芥洿蹇煡閬撯€滄柊澧炵殑鏄柊姒傚康鑺傜偣鈥濃€滄爣棰樺拰鏈€鏂板浘璋变笉涓€鑷粹€濈瓑鏇村叿浣撶殑鎻愮ず銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts`锛岃鎽樿鍦ㄤ繚鎸侀珮灞傛瑙堢殑鍓嶆彁涓嬶紝琛ュ厖鍏抽敭瀵硅薄鍚嶏細鏍囬/璇存槑宸紓浼氭樉绀哄綋鍓嶅€间笌鍩虹嚎鍊硷紝鑺傜偣/杩炵嚎/鍒嗙粍宸紓浼氬睍绀哄墠涓や釜鍏抽敭鍚嶇О骞跺湪闇€瑕佹椂杩藉姞鈥滅瓑鈥濄€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphConflictSummary.test.ts`锛岃ˉ榻愨€滃叧閿璞″悕鎽樿鈥濆拰鈥滆秴杩囦袱涓璞℃椂鐨勬牱鏈埅鏂€濆洖褰掞紝閿佸畾鎽樿鍙ｅ緞銆?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 鍜?`GraphWorkspaceStageChrome.test.tsx`锛岃椤甸潰涓庣粍浠跺洖褰掔洿鎺ラ獙璇佲€滄柊姒傚康鈥濃€淕raph on server鈥濊繖绫绘洿鍏蜂綋鐨勫啿绐佹彁绀猴紝鑰屼笉鏄彧鐩暟閲忋€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鐨勫綋鍓嶈竟鐣屾槑纭负鈥滄湰鍦拌崏绋跨暀瀛樿緟鍔?+ 鏈湴鎽樿 + 鏈€鏂?head 鎽樿 + 鍏抽敭瀵硅薄鍚嶇骇鎻愮ず鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍐茬獊杈呭姪鍗＄墖鐜板湪宸茬粡涓嶅彧鏄€滄湁宸紓銆佸樊寮傛湁鍑犳潯鈥濓紝鑰屾槸鑳藉湪淇濈暀鎽樿绠€娲佸害鐨勫墠鎻愪笅锛屾妸鏈€鍏抽敭鐨勫璞″悕鐩存帴甯﹀嚭鏉ワ紝鏄捐憲闄嶄綆鐢ㄦ埛鐞嗚В鍐茬獊涓婁笅鏂囩殑鎴愭湰銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄繚鐣?鏀惧純/鍚庣画浜哄伐鍚堝苟鐨勫彇鑸嶈緟鍔╋紝浠ュ強鏇村畬鏁寸殑澶氱 conflict handling锛岃鍐茬獊鍗＄墖涓嶅彧瑙ｉ噴闂锛岃繕鑳芥洿绉瀬鍦板府鍔╃敤鎴峰仛鍐崇瓥銆?
## 2026-07-02 00:33:20 +08:00 | v1.1.0-alpha.81 | 鎺ㄨ繘 WB-032 闈㈠悜鏈€鏂?head 鐨勫啿绐佸樊寮傛憳瑕佸瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滃綋鍓嶆湭淇濆瓨淇敼鎽樿鈥濅箣鍚庯紝鍐嶈ˉ涓€灞傜湡姝ｉ潰鍚戞湇鍔＄鏈€鏂板浘璋辩殑鍐茬獊宸紓鎻愮ず銆?- 鏈疆鐩爣鏄笉璁╁啿绐佽緟鍔╁崱鐗囧彧鍋滅暀鍦ㄢ€滀綘鏈湴鏀逛簡浠€涔堚€濓紝鑰屾槸杩涗竴姝ュ憡璇夌敤鎴封€滆繖浜涙湰鍦颁慨鏀逛笌鏈嶅姟绔渶鏂?head 鐩告瘮涓昏宸湪鍝噷鈥濄€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛氬綋宸ヤ綔鍖鸿繘鍏?dirty 鍐茬獊鎬佷笖寤鸿閲嶈浇鏈€鏂板浘璋辨椂锛屼細闈欓粯鎷夊彇涓€娆℃湇鍔＄鏈€鏂?graph head锛屽苟鎶婄粨鏋滀繚瀛樺湪鍐茬獊杈呭姪鐘舵€侀噷锛岃€屼笉鎵撴柇鐢ㄦ埛褰撳墠鍐崇瓥娴併€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛氬啿绐佽緟鍔╁崱鐗囩幇鍦ㄩ櫎浜嗏€滃綋鍓嶆湭淇濆瓨淇敼鈥濆锛岃繕浼氬睍绀衡€滀笌鏈€鏂板浘璋辩浉姣斺€濈殑绗簩缁勫樊寮傛憳瑕侊紱濡傛灉鏈€鏂?head 灏氬湪鎷夊彇涓垨鏆傛椂涓嶅彲鐢紝涔熶細缁欏嚭瀵瑰簲璇存槑銆?- 缁х画澶嶇敤 `graphConflictSummary` helper锛岃鏈湴 vs 鏈€鏂?head 鐨勫樊寮傛憳瑕佷繚鎸佸拰鈥滃綋鍓嶆湭淇濆瓨淇敼鎽樿鈥濅竴鑷寸殑鍙ｅ緞锛岄伩鍏嶄袱濂椾笉鍚岀殑宸紓瑙勫垯鍦?UI 涓婁簰鐩告墦鏋躲€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 鍜?`GraphWorkspaceStageChrome.test.tsx`锛岄攣瀹氣€滃啿绐佺幇鍦哄悓鏃跺睍绀烘湰鍦版湭淇濆瓨淇敼鎽樿涓庨潰鍚戞渶鏂?head 鐨勫樊寮傛憳瑕佲€濈殑椤甸潰涓庣粍浠惰涓恒€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滄湰鍦拌崏绋跨暀瀛樿緟鍔?+ 褰撳墠鏈繚瀛樹慨鏀规憳瑕?+ 鏈€鏂?head 宸紓鎽樿鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ湪 dirty 鍐茬獊鎬佷笅涓嶅啀鍙細璇粹€滀綘鏈湴鏈夋湭淇濆瓨淇敼鈥濓紝鑰屾槸浼氬苟鍒楀睍绀衡€滄湰鍦版敼浜嗕粈涔堚€濆拰鈥滀笌鏈€鏂板浘璋辩浉姣斿樊浜嗕粈涔堚€濓紝璁╃敤鎴峰湪鍐冲畾鐣欏瓨銆佹斁寮冩垨閲嶈浇鍓嶆湁鏇村畬鏁寸殑涓婁笅鏂囥€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄洿缁嗙矑搴︾殑鍐茬獊宸紓銆佸悎骞?淇濈暀鍙栬垗杈呭姪锛屼互鍙婃洿瀹屾暣鐨勫绔?conflict handling锛岃鐢ㄦ埛涓嶅彧鐪嬪埌鎽樿锛岃繕鑳芥洿涓诲姩鍦板鐞嗗啿绐併€?
## 2026-07-02 00:27:40 +08:00 | v1.1.0-alpha.80 | 鎺ㄨ繘 WB-032 褰撳墠鏈繚瀛樹慨鏀规憳瑕佸瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滃啿绐佹€佹湰鍦拌崏绋跨暀瀛樿緟鍔┾€濅箣鍚庯紝鍐嶈ˉ涓€灞傛洿鍙悊瑙ｇ殑鍐茬獊鎽樿銆?- 鏈疆鐩爣鏄鐢ㄦ埛鍦?dirty 鍐茬獊鎬佷笅涓嶄粎鐭ラ亾鈥滃彲浠ュ鍒?瀵煎嚭鏈湴鑽夌鈥濓紝杩樼煡閬撯€滃綋鍓嶈繖浠芥湰鍦拌崏绋跨浉瀵规渶鍚庝竴娆″凡鍚屾鎴愬姛鐨勫浘璋卞埌搴曟敼浜嗕粈涔堚€濄€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphConflictSummary.ts` 鍙婂搴旀祴璇曪紝鍩轰簬鈥滃綋鍓嶅伐浣滃尯鍥捐氨鈥濅笌鈥滄渶鍚庝竴娆″凡鍚屾鎴愬姛鐨勫浘璋卞熀绾库€濈敓鎴愬綋鍓嶆湭淇濆瓨淇敼鎽樿锛岃鐩栨爣棰?璇存槑鍙樺寲銆佽妭鐐?杩炵嚎/鍒嗙粍鐨勬柊澧炪€佷慨鏀广€佸垹闄わ紝浠ュ強浠呰鍙ｅ彉鍖栨椂鐨勫厹搴曟彁绀恒€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾樉寮忕淮鎶?`lastSyncedDetailRef` 浣滀负鏈€鍚庡悓姝ュ熀绾匡紝骞跺湪 dirty 鍐茬獊鎬佷笅鎶婃憳瑕佷紶缁欏啿绐佽緟鍔╁崱鐗囥€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛岃鍐茬獊杈呭姪鍗＄墖鏄剧ず鈥滃綋鍓嶆湭淇濆瓨淇敼鎽樿鈥濓紝鎶娾€滀綘灏嗘斁寮冧粈涔堚€濈洿鎺ユ斁鍒板啿绐佺幇鍦猴紝鑰屼笉鏄彧缁欏姩浣滄寜閽€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 涓?`GraphWorkspaceStageChrome.test.tsx`锛岄攣瀹氣€滃啿绐佺幇鍦烘樉绀轰慨鏀规憳瑕併€佸悓鏃朵繚鐣欏鍒?瀵煎嚭/閲嶈浇鍔ㄤ綔鈥濈殑椤甸潰涓庣粍浠惰涓恒€?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鐨勮竟鐣屾槑纭负鈥滃厛鐪嬫湰鍦版湭淇濆瓨淇敼鎽樿锛屽啀鍐冲畾鏄惁鐣欏瓨鎴栨斁寮冣€濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphConflictSummary.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ湪 dirty 鍐茬獊鎬佷笅涓嶅啀鍙槸鈥滆兘涓嶈兘鐣欏瓨褰撳墠鑽夌鈥濈殑闂锛岃€屾槸浼氬厛鎶婂綋鍓嶆湭淇濆瓨淇敼鎽樿灞曠ず鍑烘潵锛屽府鍔╃敤鎴锋洿娓呮鍦板垽鏂嚜宸辨槸涓嶆槸瑕佸厛鐣欏瓨銆佹槸鍚﹀彲浠ユ帴鍙楁斁寮冦€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄潰鍚戔€滄湇鍔＄鏈€鏂?head鈥濈殑鏇村畬鏁村啿绐佸樊寮傚睍绀轰笌鏇村己鐨勫绔?conflict handling锛岃鐢ㄦ埛涓嶅彧鐭ラ亾鑷繁鏈湴鏀逛簡浠€涔堬紝杩樿兘鐭ラ亾杩欎簺鏀瑰姩涓庢渶鏂扮増鏈殑鍏崇郴銆?
## 2026-07-01 20:21:30 +08:00 | v1.1.0-alpha.79 | 鎺ㄨ繘 WB-032 鍐茬獊鎬佹湰鍦拌崏绋跨暀瀛樿緟鍔╁瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滄樉寮忛噸杞芥渶鏂板浘璋扁€濅箣鍚庯紝鍐嶈ˉ涓€灞傛洿绋冲Ε鐨勫啿绐佸彇鑸嶈緟鍔┿€?- 鏈疆鐩爣鏄伩鍏嶇敤鎴峰湪鐗堟湰鍐茬獊鏃跺彧鑳戒簩閫変竴鍦扳€滅珛鍒绘斁寮冨苟閲嶈浇鈥濇垨鈥滆嚜宸辨懜绱㈡€庝箞鐣欏瓨鏈湴淇敼鈥濓紝鑰屾槸鎶婄暀瀛樻湰鍦拌崏绋跨殑鍔ㄤ綔鏄惧紡鏀惧埌鍐茬獊鐜板満銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屾柊澧炲浘璋卞啿绐佽緟鍔╁崱鐗囷紱褰撳綋鍓嶅伐浣滃尯澶勪簬 dirty 鍐茬獊鎬佹椂锛屼細鏄庣‘灞曠ず `澶嶅埗褰撳墠鑽夌 JSON` 鍜?`瀵煎嚭褰撳墠鑽夌 JSON`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`copyConflictDraftJson()` 涓?`exportConflictDraftJson()`锛氱洿鎺ュ熀浜庡綋鍓嶅伐浣滃尯鐨勫疄鏃跺浘璋辨瀯寤?StudyMate JSON锛屽湪鏀惧純閲嶈浇鍓嶄负鏈湴淇敼鎻愪緵鐣欏瓨璺緞锛屽苟淇濇寔鈥滈噸鏂板姞杞芥渶鏂板浘璋扁€濈殑鍐茬獊鍐崇瓥鐘舵€佷笉琚緟鍔╁姩浣滄竻鎺夈€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx` 鍜?`GraphWorkspaceStageChrome.test.tsx`锛岃ˉ榻愰〉闈㈢骇涓庣粍浠剁骇鍥炲綊锛岄攣瀹氣€滃啿绐佺幇鍦烘樉绀虹暀瀛樿緟鍔╁姩浣溿€佺偣鍑昏緟鍔╁姩浣滃悗浠嶄繚鐣欓噸杞藉喅绛栨祦鈥濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鐨勫綋鍓嶈竟鐣屼粠鈥滄樉寮忛噸杞解€濇帹杩涘埌鈥滃厛鐣欏瓨鏈湴淇敼锛屽啀鍐冲畾鏄惁閲嶈浇鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ湪 dirty 鍐茬獊鎬佷笅涓嶅啀鍙湁鈥滆涓嶈鏀惧純骞堕噸杞解€濊繖涓€鏉″崟绾垮喅绛栵紝鑰屾槸鎶娾€滃厛澶嶅埗/瀵煎嚭褰撳墠鑽夌锛屽啀鍐冲畾鏄惁鏀惧純鈥濆彉鎴愭樉寮忋€佸氨鍦般€佸彲娴嬭瘯鐨勮緟鍔╂祦绋嬨€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄啿绐佸樊寮傛憳瑕佸拰鏇村畬鏁寸殑澶氱 conflict handling锛岃鐢ㄦ埛涓嶄粎鑳界暀瀛樻湰鍦颁慨鏀癸紝杩樿兘鏇存竻妤氬湴鐞嗚В鑷繁鍗冲皢鏀惧純鐨勫唴瀹逛笌鏈嶅姟绔渶鏂?head 鐨勫樊寮傘€?
## 2026-07-01 20:08:30 +08:00 | v1.1.0-alpha.78 | 鎺ㄨ繘 WB-032 鏄惧紡閲嶈浇鏈€鏂板浘璋卞喅绛栨祦瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屾妸姝ゅ墠鈥滃彟涓€绐楀彛姝ｅ湪缂栬緫 / 宸蹭繚瀛樻洿楂樼増鏈€濈殑鎻愰啋锛岃繘涓€姝ュ崌绾т负鐢ㄦ埛鍙墽琛岀殑鏈€灏忓喅绛栨祦銆?- 鏈疆鐩爣鏄厛鏀跺彛瀹夊叏鐨勬樉寮忛噸杞借竟鐣岋細褰撳綋鍓嶆爣绛鹃〉宸茬粡钀藉悗鏃讹紝鍏佽鐢ㄦ埛涓诲姩鎷夊彇鏈€鏂板浘璋憋紱濡傛灉鏈湴浠嶆湁鏈繚瀛樹慨鏀癸紝蹇呴』鏄庣‘纭鏀惧純鍚庢墠鑳界户缁€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛岃鍥捐氨鐘舵€佹爮鏀寔鍙€夊姩浣滄寜閽紝骞跺湪闇€瑕佹椂灞曠ず `閲嶆柊鍔犺浇鏈€鏂板浘璋盽銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊澧?`reloadLatestGraph()` 娴佺▼锛歞irty 鐘舵€佷笅鍏堝脊纭锛岄殢鍚庨噸鏂版媺鍙栨渶鏂?`getGraph(...)` head銆侀噸缃?history/save-state銆佸埛鏂?snapshot 鍒楄〃锛屽苟鍦ㄦ垚鍔熷悗鏄庣‘鎻愮ず鈥滃凡閲嶆柊鍔犺浇鏈€鏂板浘璋憋紝鏈繚瀛樻洿鏀瑰凡鏀惧純鈥濄€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`锛岃鈥滃彟涓€绐楀彛宸蹭繚瀛樻洿楂樼増鏈€濅笌 `batch-save` 鍛戒腑 `graph_version_conflict` 鏃堕兘鑳界ǔ瀹氫繚鐣欌€滃缓璁噸杞芥渶鏂板浘璋扁€濈殑椤甸潰鐘舵€侊紝涓嶅啀琚悗缁け璐ユ枃妗堟剰澶栨竻鎺夈€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`銆乣GraphWorkspaceStageChrome.test.tsx` 鍜?`useGraphWorkspacePersistence.test.tsx`锛岃ˉ榻愰〉闈㈢骇銆佺姸鎬佹爮绾т笌 hook 绾у洖褰掞紝閿佸畾鈥滃嚭鐜板啿绐佸悗灞曠ず閲嶈浇鍔ㄤ綔銆乨irty 鏃剁‘璁ゆ斁寮冦€侀噸杞藉悗娓呯悊澶辫触鐘舵€佲€濈殑琛屼负銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鐨勫啿绐佸鐞嗚竟鐣屼粠鈥滃墠缃彁閱掆€濇帹杩涘埌鈥滅敤鎴峰彲鎺х殑鏄惧紡閲嶈浇鍔ㄤ綔鈥濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 鍏堝洜鐗堟湰鍐茬獊璺緞娌℃湁淇濈暀閲嶈浇鍔ㄤ綔鑰?RED锛屼慨姝ｇ姸鎬佹祦杞『搴忓悗閫氳繃銆?- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 鍏堝洜娴嬭瘯鏀灦鏈ˉ `onReloadLatestSuggestionChange` 鑰?RED锛岃ˉ榻?harness 涓庡洖褰掓柇瑷€鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄤ笉鍙細鍛婅瘔鐢ㄦ埛鈥滀綘宸茬粡钀藉悗浜庢渶鏂扮増鏈€濓紝杩樹細鎶娾€滄斁寮冨綋鍓嶆湭淇濆瓨淇敼骞堕噸杞芥渶鏂板浘璋扁€濆彉鎴愪竴涓槑纭€佸彲棰勬湡銆佸彲娴嬭瘯鐨勫姩浣滐紝鍑忓皯鐢ㄦ埛鍋滃湪澶辫触鎬佸嵈涓嶇煡閬撲笅涓€姝ヨ鎬庝箞鍋氱殑鎯呭喌銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ洿鍊煎緱缁х画琛ョ殑鏄啿绐佸樊寮傚睍绀恒€佹湰鍦颁慨鏀瑰鍑?澶嶅埗杈呭姪锛屼互鍙婃洿瀹屾暣鐨勫绔?conflict handling锛岃€屼笉鏄啀鍋滅暀鍦ㄥ彧鏈夋彁閱掓垨鍙湁澶辫触鏂囨鐨勭姸鎬併€?
## 2026-07-01 19:57:20 +08:00 | v1.1.0-alpha.77 | 鎺ㄨ繘 WB-032 璺ㄧ獥鍙ｅ啿绐佹彁绀轰笌 stale 鑽夌瑙ｉ噴瀛愭楠?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滃悓鍥捐氨鏈湴鑽夌鎭㈠鈥濅箣鍚庯紝鍐嶈ˉ涓婁竴灞傛洿涓诲姩鐨勫啿绐佹彁绀猴細鐢ㄦ埛涓嶅簲鍙湪淇濆瓨鏃舵姤 `409` 鏃舵墠绗竴娆＄煡閬撳彟涓€涓獥鍙ｅ凡缁忕紪杈戞垨淇濆瓨浜嗗悓涓€鍥捐氨銆?- 鏈疆鍚屾椂琛?stale local draft 鐨勫彲瑙ｉ噴鍙嶉锛岄伩鍏嶅伐浣滃尯闈欓粯涓㈠純鏃ц崏绋挎椂锛岀敤鎴疯浠ヤ负绯荤粺鎶婂唴瀹瑰悶鎺変簡銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphWorkspaceConcurrencySignal.ts` 涓庡搴旀祴璇曪紝鎸?`graphId + sessionId` 鎶婂綋鍓嶇獥鍙ｇ殑 `dirty/currentVersion` 鐘舵€佸啓鍏?`localStorage`锛屼綔涓鸿法绐楀彛杞婚噺 signal銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`锛氬伐浣滃尯鐜板湪浼氱洃鍚悓鍥捐氨鐨?`storage` 浜嬩欢锛涙娴嬪埌鍙︿竴绐楀彛浠嶅湪缂栬緫鏃讹紝鎻愮ず鈥滆淇濆瓨鍓嶇‘璁ゆ渶鏂扮増鏈€濓紱妫€娴嬪埌鍙︿竴绐楀彛宸蹭繚瀛樻洿楂樼増鏈椂锛屾彁绀衡€滆鍒锋柊鍥捐氨鍚庡啀缁х画缂栬緫鈥濄€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛氬綋鏈湴鑽夌鍥犱负鏈嶅姟绔?head 宸叉帹杩涜€岃鏀惧純鏃讹紝椤甸潰浼氭槑纭彁绀衡€滄湰鍦拌崏绋垮熀浜庢棫鐗堟湰锛屽凡鏀惧純鎭㈠骞跺姞杞芥渶鏂板浘璋扁€濓紝涓嶅啀闈欓粯鍥為€€鍒版渶鏂扮敾甯冦€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`銆乣useGraphWorkspacePersistence.test.tsx` 鍜?`graphPersistenceState.test.ts`锛屾妸 stale 鑽夌瑙ｉ噴鏂囨涓庤法绐楀彛鍐茬獊鎻愮ず鍥哄畾涓洪〉闈㈢骇/Hook 绾у洖褰掋€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/GraphWorkspacePage.test.tsx` 鍏堝洜缂哄皯骞跺彂 signal helper 涓?stale draft 瑙ｉ噴鏂囨鑰?RED锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphWorkspaceConcurrencySignal.test.ts src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ凡缁忎笉鍙槸鍦ㄢ€滀繚瀛樺け璐ュ悗涓嶄涪鏈湴缂栬緫鈥濓紝鑰屾槸鑳芥洿鏃╁憡璇夌敤鎴封€滃彟涓€涓獥鍙ｄ篃鍦ㄥ姩杩欏紶鍥锯€濓紝浠庤€岄檷浣庨潤榛樺啿绐佸拰璇搷浣滄鐜囥€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ユ渶鍊煎緱缁х画琛ョ殑鏄樉寮忓埛鏂?閲嶈浇纭鍜屾洿瀹屾暣鐨勫啿绐佸喅绛栨祦锛岃鈥滄彁閱掆€濆崌绾ф垚鈥滅敤鎴峰彲鎺х殑鎭㈠/鍙栬垗鍔ㄤ綔鈥濄€?
## 2026-07-01 19:49:30 +08:00 | v1.1.0-alpha.76 | 鎺ㄨ繘 WB-032 鍚屽浘璋辨湰鍦拌崏绋挎仮澶嶅瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽湪鈥滀繚瀛樺啿绐佸彲瑙佲€濆拰鈥渄irty 鏃剁姝㈡仮澶嶅揩鐓р€濅箣鍚庯紝琛ヤ笂鍚屼竴鍥捐氨閲嶆柊鎵撳紑鏃剁殑鏈湴鏈繚瀛樿崏绋挎仮澶嶈兘鍔涖€?- 鏈疆鐩爣鏄厛鏀跺彛鏈€灏忓畨鍏ㄦ仮澶嶈竟鐣岋細鍙湁鏈嶅姟绔?head 鐗堟湰鏈彉鍖栨椂鎵嶆仮澶嶆湰鍦拌崏绋匡紱濡傛灉 head 宸叉帹杩涳紝鍒欏畞鍙斁寮冩棫鑽夌锛屼篃涓嶈兘闈欓粯瑕嗙洊褰撳墠鍥捐氨銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphWorkspaceDraftRecovery.ts` 涓?`graphWorkspaceDraftRecovery.test.ts`锛屾妸鍥捐氨鏈湴鑽夌鎭㈠瑙勫垯鏀跺彛涓虹嫭绔?helper锛氭寜 `graphId` 钀界洏 `title` / `description` / `document` / `currentVersion`锛屾敮鎸佽鍙栥€佹竻鐞嗗拰鍩轰簬鐗堟湰涓€鑷存€х殑鎭㈠鍒ゅ畾銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`锛氬綋鍓嶅伐浣滃尯涓€鏃﹁繘鍏?`dirty` 鐘舵€侊紝灏辨妸鑽夌鍐欏叆 `sessionStorage`锛涗繚瀛樻垚鍔熸垨閲嶆柊鍥炲埌闈?dirty 鐘舵€佹椂锛岃嚜鍔ㄦ竻鐞嗗搴斿浘璋辫崏绋裤€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛氬伐浣滃尯棣栨鍔犺浇鎴栧垏鎹㈠浘璋辨椂锛屼細浼樺厛妫€鏌ュ悓鍥捐氨鏈湴鑽夌锛涜嫢 `currentVersion` 涓庢湇鍔＄涓€鑷达紝鍒欐仮澶嶆湰鍦拌崏绋垮苟缁存寔 dirty 鐘舵€侊紱鑻ョ増鏈笉涓€鑷达紝鍒欐竻鐞?stale draft锛岀户缁互鏈嶅姟绔?head 涓哄噯銆?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛屾柊澧為〉闈㈢骇鍥炲綊閿佸畾鈥滃悓鍥捐氨 + 鍚岀増鏈€濋噸寮€鍚庝細鐪嬪埌鎭㈠鎻愮ず銆佺户缁浜?dirty 鐘舵€侊紝涓旀湰鍦拌妭鐐逛粛鑳藉湪鐢诲竷涓壘鍒般€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphWorkspaceDraftRecovery.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 鍏堝洜缂哄皯鎭㈠妯″潡鑰?RED锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ凡缁忓叿澶団€滃悓鍥捐氨鏈繚瀛樼紪杈戞壘鍥炩€濈殑鏈€灏忔仮澶嶈兘鍔涳紝鐢ㄦ埛鍒锋柊鎴栭噸鏂拌繘鍏ュ悓涓€鍥捐氨鏃讹紝涓嶅啀鍙兘渚濊禆杩滅 autosave 鎴栨墜鍔ㄤ繚瀛樻墠鑳戒繚浣忓垰鍋氱殑淇敼銆?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ュ簲缁х画琛ュ绐楀彛/澶氱鍐茬獊鎻愮ず銆乻tale draft 鐨勫彲瑙ｉ噴鍙嶉锛屼互鍙婃洿瀹屾暣鐨勬仮澶嶅喅绛栨祦锛岄伩鍏嶇敤鎴峰湪骞跺彂缂栬緫鍦烘櫙涓嬪彧鐪嬪埌鈥滆崏绋挎秷澶扁€濊€屼笉鐭ラ亾鍘熷洜銆?
## 2026-07-01 19:33:56 +08:00 | v1.1.0-alpha.75 | 鎺ㄨ繘 WB-032 鍥捐氨蹇収鎭㈠鍓嶄繚鎶ゅ瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛岃ˉ涓婁繚瀛樺啿绐佸彲瑙佹€т箣鍚庣殑涓嬩竴鏉℃仮澶嶅畨鍏ㄨ竟鐣岋細褰撳墠鐢诲竷浠嶆湁鏈湴鏈繚瀛樹慨鏀规椂锛屼笉鍏佽鐩存帴鎭㈠鍘嗗彶蹇収銆?- 鏈疆鐩爣涓嶆槸瀹屾垚瀹屾暣鐨?autosave 鎭㈠閾捐矾锛岃€屾槸鍏堥樆鏂€渄irty 鐢诲竷涓€閿仮澶嶅揩鐓у鑷存湰鍦扮紪杈戣闈欓粯瑕嗙洊鈥濈殑楂橀闄╄矾寰勩€?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/graph/lib/graphPersistenceState.ts`锛屾柊澧炲揩鐓ф仮澶嶅墠淇濇姢鐘舵€侊紝鏄庣‘杈撳嚭鈥滃綋鍓嶅浘璋变粛鏈夋湭淇濆瓨淇敼锛岃鍏堜繚瀛樺悗鍐嶆仮澶嶅揩鐓р€濇彁绀猴紝骞朵繚鎸佷繚瀛樻€佷负 `dirty`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`锛歚restoreSnapshot(...)` 鐜板湪浼氬厛妫€鏌?`options.dirty`锛涘瓨鍦ㄦ湭淇濆瓨缂栬緫鏃剁洿鎺ラ樆鏂仮澶嶈姹傦紝涓嶈繘鍏ヨ繙绔?restore API锛屼篃涓嶉噸缃巻鍙茬姸鎬併€?- 鏇存柊 `frontend-user/src/modules/graph/lib/graphPersistenceState.test.ts`锛岄攣瀹氭仮澶嶅墠淇濇姢鐘舵€佸璞°€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛屾柊澧為〉闈㈢骇鍥炲綊锛氬厛鍒堕€?dirty 缂栬緫锛屽啀鐐瑰嚮鎭㈠蹇収鏃讹紝搴旂户缁樉绀衡€滄湁鏈繚瀛樹慨鏀光€濈姸鎬佸苟缁欏嚭淇濇姢鎻愮ず锛屽悓鏃朵笉寰楀彂鍑?`restoreGraphSnapshot(...)` 璇锋眰銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 鍏堝洜缂哄皯鎭㈠鍓嶄繚鎶?helper 鍜?dirty guard 鑰?RED锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/components/GraphWorkspaceRecoveryPanel.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹幇鍦ㄥ凡缁忎笉浠呰兘闃叉鏃х増鏈繚瀛橀潤榛樿鐩栵紝涔熻兘闃叉 dirty 鐘舵€佷笅鐨勫揩鐓ф仮澶嶉潤榛樻浛鎹㈠綋鍓嶇敾甯冿紝`WB-032` 鐨勨€滄仮澶嶅畨鍏ㄢ€濊竟鐣屽洜姝ゆ洿瀹屾暣浜嗕竴灞傘€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涗笅涓€姝ヤ粛搴斾紭鍏堣ˉ autosave 鑽夌鎭㈠涓庢洿瀹屾暣鐨勫绐楀彛鍐茬獊鎻愮ず锛岃淇濆瓨銆佹仮澶嶄笌绂婚〉涓夋潯閾捐矾鐪熸闂幆銆?
## 2026-07-01 14:55:51 +08:00 | v1.1.0-alpha.74 | 鎺ㄨ繘 WB-032 鍥捐氨淇濆瓨鐗堟湰鍐茬獊鍙鎬у瓙姝ラ
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-032`锛屽厛浠庨闄╂渶鐩存帴鐨勪竴鍒€鍒囧叆锛氶伩鍏嶆棫鏍囩椤点€佹棫鑽夌鎴栬惤鍚庣増鏈殑 batch-save 闈欓粯瑕嗙洊宸茬粡鏇存柊杩囩殑 graph head銆?- 鏈疆涓嶆妸 `WB-032` 璇姤鎴愭暣浣撳畬鎴愶紝鑰屾槸鍏堟敹鍙ｂ€滀繚瀛樺啿绐佸繀椤诲彲瑙併€佸け璐ュ悗鏈湴鑴忕紪杈戜笉鑳戒涪鈥濈殑鏈€灏忓彲闈犳€ц竟鐣岋紝涓哄悗缁?autosave 鎭㈠鍜?snapshot 瀹夊叏鎭㈠缁х画鎵撳簳銆?### 瀹屾垚缁撴灉
- 鏇存柊 `backend/internal/modules/graph/service/service.go`锛歚BatchSave(...)` 鐜板湪浼氬湪浠讳綍鎸佷箙鍖栧墠鏍￠獙 `request.document.version == graph.current_version`锛涘鏋滃鎴风鐗堟湰钀藉悗锛屽垯杩斿洖 `409 graph_version_conflict`锛屽苟鐩存帴闃绘柇鍐欏叆銆?- 鏇存柊 `backend/internal/modules/graph/service/service_test.go`锛氭柊澧炲洖褰掓祴璇曢攣瀹氭棫鐗堟湰淇濆瓨蹇呴』澶辫触锛屼笖涓嶅緱鍐欏叆 `graphs.current_version`銆乣graph_versions` 鎴?Mongo current document銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx`锛氭柊澧炲啿绐佸け璐ユ€佸洖褰掞紝閿佸畾淇濆瓨澶辫触鍚庝粛淇濇寔 `dirty:true` 鍜屽啿绐佹枃妗堬紝纭繚鏈湴鏈繚瀛樼紪杈戜笉浼氳澶辫触娴佺▼鍚炴帀銆?- 鍚屾鏇存柊 `docs/architecture/GRAPH_API_LIFECYCLE.md`銆乣docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 鍜?`CHANGELOG.md`锛屾妸 `WB-032` 鏍囪涓鸿繘琛屼腑锛屽苟鎶?`batch-save` 鐨?`409 graph_version_conflict` 濂戠害鍐欏叆鏂囨。銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service` 鍏堝洜鏂版祴璇曞懡涓€滄棫鐗堟湰淇濆瓨琚潤榛樿鐩栤€濊€?RED锛岃ˉ涓婄増鏈墠缃牎楠屽悗杞豢銆?- `go test ./internal/modules/graph/...` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/hooks/useGraphWorkspacePersistence.test.tsx src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨淇濆瓨閾捐矾鐜板湪鑷冲皯宸茬粡鍏峰鈥滄棫鐗堟湰涓嶈兘闈欓粯瑕嗙洊鏂?head鈥濈殑鏈€灏忓畨鍏ㄨ竟鐣岋紝鍚庣画 autosave 涓庡绐楀彛缂栬緫鍙互鍦ㄦ槑纭啿绐佷俊鍙蜂笂缁х画寤鸿锛岃€屼笉闇€瑕佸厛鍥炲ご琛ュ簳灞傜増鏈繚鎶ゃ€?- `WB-032` 浠嶅浜庤繘琛屼腑锛涙帴涓嬫潵鏈€鍊煎緱缁х画鎺ㄨ繘鐨勬槸 autosave 鑽夌鎭㈠銆乻napshot 鎭㈠鍓嶄繚鎶わ紝浠ュ強鏇存槑纭殑澶氱鍐茬獊鎻愮ず涓庣敤鎴峰喅绛栨祦銆?
## 2026-07-01 15:05:00 +08:00 | v1.1.0-alpha.73 | 瀹屾垚 WB-031 鍥捐氨瀵煎嚭銆佺缉鐣ュ浘涓庡竷灞€濂戠害鏀跺彛
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-031`锛屾妸鍥捐氨鐜版湁鐨?JSON/SVG/PNG 瀵煎嚭銆佺缉鐣ュ浘涓昏褰曞瓧娈靛拰鏉ユ簮娉抽亾甯冨眬鑳藉姏鏁寸悊鎴愮粺涓€濂戠害锛岄伩鍏嶈繖浜涜兘鍔涢暱鏈熷垎鏁ｅ湪鍓嶇灞€閮?helper銆佹暟鎹簱瀛楁鍜岄殣鍚疄鐜伴噷銆?- 鏈疆閲嶇偣涓嶆槸缁х画鎵╁紶鏂扮殑鍥捐氨鍔熻兘锛岃€屾槸鍏堟妸鈥滃鍑轰骇鐗╂€庝箞瀹氫箟鈥濃€済raph head 濡備綍鎸傜缉鐣ュ浘鈥濃€滃竷灞€鑳藉姏濡備綍杩涘叆缁熶竴 API 鐢熷懡鍛ㄦ湡鈥濊繖涓変欢浜嬫敹鍙ｆ竻妤氾紝涓哄悗缁?autosave銆佸啿绐佸鐞嗗拰宸ョ▼鍥捐氨瀵煎叆鎻愪緵绋冲畾杈圭晫銆?### 瀹屾垚缁撴灉
- 鏂板 `docs/architecture/GRAPH_EXPORT_LAYOUT_CONTRACT.md`锛岄泦涓鏄?JSON/SVG/PNG 瀵煎嚭杈圭晫銆乣thumbnailFileId` head 瀛楁銆佷互鍙?`POST /api/v1/graphs/:id/layouts/preview` 鐨勮姹?鍝嶅簲涓庝笉鎺ㄨ繘鐗堟湰璇箟銆?- 鏇存柊鍚庣 graph DTO銆乻ummary builder 鍜屽墠绔?API types锛岃 `thumbnailFileId` 浠庢暟鎹簱瀛楁鎻愬崌涓哄墠鍚庣鍏变韩鐨?graph 鎽樿濂戠害銆?- 鏂板鍚庣鏉ユ簮娉抽亾甯冨眬棰勮鍏ュ彛锛歚POST /graphs/:id/layouts/preview`銆傝鎺ュ彛浼氱敤鏈嶅姟绔潈濞?`graphId` / `version` 褰掍竴鍖栧鎴风鏂囨。鑽夌锛岃繑鍥炲竷灞€鍚庣殑 document銆乴aneCount 鍜?selectedNodeIds锛屼絾涓嶄細鍐欏叆 current document銆乻napshot 鎴?graph version銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽浘璋卞伐浣滃尯鐢熸垚鏉ユ簮娉抽亾鏃朵紭鍏堣皟鐢ㄥ悗绔?preview API锛涙帴鍙ｄ笉鍙敤鏃朵粛鍥為€€鍒版湰鍦?`buildGraphSourceSwimlaneDocument(...)`锛屼繚鎸佹湰鍦板閿欎笌缁熶竴濂戠害骞跺瓨銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service ./internal/modules/graph/handler` 鍏堝洜缂哄け `PreviewLayout` DTO/handler/service 鑰?RED锛岃ˉ瀹炵幇鍚庤浆缁裤€?- `go test ./internal/modules/graph/...` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts` 鍏堝洜缂哄け `previewGraphLayout(...)` 鑰?RED锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphSourceSwimlanes.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨甯冨眬鐜板湪宸茬粡涓嶅啀鍙槸宸ヤ綔鍖哄唴閮ㄨ涓猴紝鑰屾槸杩涘叆浜嗙粺涓€ graph API 濂戠害锛涘悗缁棤璁烘帴鏇村甯冨眬绠楁硶銆佸伐绋嬪浘妯℃澘杩樻槸鍚庡彴娌荤悊鍏ュ彛锛岄兘鏈変簡绋冲畾鐨?request/response 褰㈢姸銆?- `thumbnailFileId` 鐜板湪鎴愪负 graph head 鐨勬樉寮忎竴閮ㄥ垎锛屽悗缁?`WB-032` 鍜屾洿杩滅殑鍒嗕韩/鎼滅储鍗＄墖灞曠ず鍙互鐩存帴鍥寸粫杩欎釜瀛楁寤虹珛寮傛缂╃暐鍥鹃摼璺紝鑰屼笉闇€瑕佸啀娆″洖澶存敼 summary contract銆?
## 2026-07-01 14:40:00 +08:00 | v1.1.0-alpha.72 | 瀹屾垚 WB-030 鍥捐氨 API 鐢熷懡鍛ㄦ湡濂戠害鏀跺彛
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-030`锛屾妸鍥捐氨鍚庣宸插瓨鍦ㄧ殑 graph/document/snapshot/version/relation 璇诲啓璺緞鏁寸悊鎴愬崟涓€鐢熷懡鍛ㄦ湡濂戠害锛屽苟琛ヤ笂鑳介攣瀹氱増鏈帹杩涜涔夌殑鍚庣涓庡墠绔祴璇曘€?- 鏈疆閲嶇偣涓嶆槸鎵╁紶鏂扮殑鍥捐氨鍔熻兘锛岃€屾槸鍏堜慨鎺夆€渞estore 鍚?current document 鐗堟湰鍙峰彲鑳藉洖鍐欐棫鍊尖€濆拰鈥済raph summary mode 鍙兘涓庢仮澶嶅悗鏂囨。璇箟婕傜Щ鈥濊繖涓や釜鐢熷懡鍛ㄦ湡椋庨櫓锛屼负鍚庣画鑷姩淇濆瓨銆佸啿绐佸鐞嗗拰瀵煎嚭鑳藉姏鎵撳湴鍩恒€?### 瀹屾垚缁撴灉
- 鏂板 `docs/architecture/GRAPH_API_LIFECYCLE.md`锛岄泦涓鏄?graph head銆丮ongo current document銆丮ongo snapshot銆丮ySQL version 绱㈠紩鍜?source relation 鐨勮亴璐ｈ竟鐣屻€乪ndpoint 鐭╅樀銆佺増鏈帹杩涜鍒欙紝浠ュ強 restore 浠ユ棫鍐呭鐢熸垚鏂?head 鐨勮涔夈€?- 閲嶆瀯 `backend/internal/modules/graph/service/service.go` 鐨勪緷璧栦负鏈€灏忔帴鍙ｏ紝骞舵柊澧?`backend/internal/modules/graph/service/service_test.go`锛岄攣瀹?create graph 鍒濆鍖?version 1銆乥atch-save 鎺ㄨ繘 head 鐗堟湰骞惰惤鍦?lifecycle artifact銆乺estore snapshot 鐢熸垚鏂?head 涓旈噸绠?`graph.mode` 鐨勮涓恒€?- 鏇存柊 `backend/internal/modules/graph/dto/document_contract.go` 涓?`backend/internal/modules/graph/dto/document_contract_test.go`锛岃鎵€鏈夊啓鍏ュ瀷 graph 璺緞閮戒互鏈嶅姟绔潈濞佽鐩?`graphId` / `version`锛屼笉鍐嶄俊浠诲鎴风鎴栨棫 snapshot 鑷甫鐨勮繃鏈熺増鏈彿銆?- 鏂板 `frontend-user/src/api/graphs.test.ts`锛屾妸 batch-save銆乻napshots銆乺estore銆丮arkdown/Mermaid import銆乿alidate 鍜?diagram templates 鐨?path / method / body 濂戠害鍥哄畾涓嬫潵锛岄伩鍏嶅墠绔皟鐢ㄧ偣鍚庣画婕傜Щ銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service` 鍒濆浠?RED 鏂瑰紡鏆撮湶 service 渚濊禆鏃犳硶娉ㄥ叆 fake銆佷互鍙?restore 鍚?`document.version` 涓?`currentVersion` 涓嶄竴鑷寸殑闂锛涘畬鎴愰噸鏋勫拰淇鍚庤浆缁裤€?- `go test ./internal/modules/graph/dto ./internal/modules/graph/service` 閫氳繃銆?- `go test ./internal/modules/graph/...` 閫氳繃锛実raph dto / handler / repository / service 鍥炲綊鍏ㄧ豢銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?2 鏉?graph-core 鐢ㄤ緥鍏ㄧ豢銆?- `npm --workspace frontend-user run test -- src/api/graphs.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃锛?2 鏉″浘璋卞墠绔敤渚嬪叏缁裤€?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鐢熷懡鍛ㄦ湡鐜板湪宸茬粡鏄庣‘鐢辨湇鍔＄鎺屾帶 head version锛宺estore/import/batch-save 杩欑被鏁翠唤鏂囨。鏇挎崲娴佺▼涓嶅啀闈欓粯甯﹀洖鏃х増鏈彿锛涘悗缁?`WB-032` 鍋?autosave / conflict handling 鏃跺彲浠ョ洿鎺ュ缓绔嬪湪杩欐潯杈圭晫涓娿€?- `WB-030` 瀹屾垚鍚庯紝涓嬩竴宸ヤ綔鍖呭簲杩涘叆 `WB-031`锛屼紭鍏堣ˉ鍥捐氨瀵煎嚭浜х墿銆佺缉鐣ュ浘鍜屽竷灞€浠诲姟妯″瀷锛岃褰撳墠宸茬粡绋冲畾鐨?lifecycle 濂戠害鐪熸鎵胯浇鏇村畬鏁寸殑鍥捐氨浜у搧鍖栬兘鍔涖€?
## 2026-07-01 14:12:29 +08:00 | v1.1.0-alpha.71 | 瀹屾垚 WB-023 鍥捐氨鍐呮牳娴嬭瘯涓庤縼绉诲洖褰?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-023`锛屾妸鍥捐氨鍐呮牳鐨勨€滃簭鍒楀寲銆佸鍏ラ敊璇€佹棫鏁版嵁鍏煎銆佸巻鍙叉爤杈圭晫鈥濆洖褰掓祴璇曡ˉ榻愬埌 `@studymate/graph-core`銆?- 鏈疆閲嶇偣涓嶆墿寮犳柊鐨勫浘璋卞姛鑳斤紝鑰屾槸閿佸畾 `.smtg` 鏃ф暟鎹縼绉诲吋瀹瑰拰 history 鐘舵€佹満杈圭晫锛岄伩鍏嶅悗缁?`WB-030` 杩涘叆 API 鐢熷懡鍛ㄦ湡鏁寸悊鏃跺啀娆″紩鍏ュ鍏ュ洖褰掋€?### 瀹屾垚缁撴灉
- 鎵╁睍 `packages/graph-core/test/graphProductization.test.ts`锛屾柊澧炴棫 root-level `.smtg` 缂哄け `schemaVersion` 鐨勫吋瀹瑰鍏ャ€侀潪娉?JSON / 鏁扮粍 root / 闈炴硶 `document` 鍖呰鎷掔粷銆乭istory readable label / fallback label锛屼互鍙?past/future 鏍堜笂闄愬洖褰掓祴璇曘€?- 鏇存柊 `packages/graph-core/src/file-format.ts`锛屽皢缂哄け `schemaVersion` 鐨勬棫 StudyMate 鍥捐氨鎸?v1 鍏煎瀵煎叆澶勭悊锛屽悓鏃剁户缁嫆缁濇暟缁?root 鍜岄潪瀵硅薄 `document` 鍖呰锛岄伩鍏嶅鏉惧吋瀹硅鏀捐繃鍧?payload銆?- 澶嶆牳 graph-core history 琛屼负锛岀‘璁?undo / redo / fallback label 涓庢爤瑁佸壀閫昏緫宸茬敱鍥炲綊娴嬭瘯閿佸畾锛屾棤闇€鍐嶅湪鍓嶇鍖呰灞傞噸澶嶇淮鎶ら澶栧吋瀹瑰垎鏀€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test -- --testNamePattern="legacy root documents|graph history respects|graph history stores readable|round trips and rejects invalid schema"` 鍏堝洜缂哄け `schemaVersion` 鏃у浘璋辫鎷掔粷銆佷互鍙婃暟缁?root 琚鏀捐鑰屽け璐ワ紝琛ュ疄鐜板悗閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?2 鏉?graph-core 鐢ㄤ緥鍏ㄧ豢銆?- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- graph-core 鐜板湪宸茬粡鏄庣‘鍖哄垎鈥滄棫鐗堢己鐪?schema 鐨勫吋瀹瑰鍏モ€濆拰鈥滅粨鏋勯潪娉?payload 鐨勬嫆缁濆鍏モ€濓紝鍚庣画鍥捐氨 API 濂戠害鏁寸悊鍙互鐩存帴澶嶇敤杩欏眰杈圭晫锛岃€屼笉蹇呭啀鍦?hook 鎴?handler 涓ˉ鍏滃簳銆?- `WB-023` 瀹屾垚鍚庯紝涓嬩竴宸ヤ綔鍖呭簲鍥炲埌 `WB-030`锛屼紭鍏堟敹鍙ｅ浘璋?document/node/edge/group/snapshot 鐢熷懡鍛ㄦ湡濂戠害锛屽苟鎶婂墠鍚庣鐜板湪宸茬粡绋冲畾涓嬫矇鐨?core 鑳藉姏鎺ュ洖缁熶竴 API 杈圭晫銆?
## 2026-07-01 14:03:06 +08:00 | v1.1.0-alpha.70 | 瀹屾垚 WB-022 鍥捐氨 import / export / validation 缁熶竴鎺ュ彛
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-022`锛屾妸鍥捐氨宸ヤ綔鍖洪噷鍒嗘暎鍦?`useGraphImportExport.ts`銆乧ontroller 鍜?JSON helper 涓殑 import/export/validation 鍒嗘敮鏀跺彛鎴愮粺涓€鎺ュ彛銆?- 鏈疆閲嶇偣涓嶆柊澧炴柊鐨勫鍏ユ牸寮忥紝鑰屾槸鎶婄幇鏈?Markdown / Mermaid / StudyMate JSON / SVG / validate 琛屼负缁熶竴鍒板崟涓€ facade锛屽苟淇濈暀宸叉湁鍏煎鎬т笌鍥炲綊瑕嗙洊銆?### 瀹屾垚缁撴灉
- 閲嶅啓 `frontend-user/src/modules/graph/lib/graphFileImportExport.ts`锛屾柊澧炵粺涓€ facade锛歚buildGraphExportArtifact(...)` 缁熶竴 JSON/SVG 瀵煎嚭鎻忚堪锛宍parseGraphJsonImport(...)` 缁熶竴 JSON 瀵煎叆闃绘柇璁℃暟涓庣姸鎬佹秷鎭紝`buildRemoteGraphImportOutcome(...)` 缁熶竴 Markdown/Mermaid 杩滅瀵煎叆褰掍竴鍖栵紝`buildGraphValidationOutcome(...)` 缁熶竴 validate 鐘舵€佹憳瑕併€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphImportExport.ts`锛岃 hook 鍙繚鐣欎笅杞姐€丳NG 娓叉煋銆佽繙绔?API 璋冪敤鍜屼繚瀛樻€佸壇浣滅敤锛屼笉鍐嶉噸澶嶇淮鎶ゅ鍏ユā寮忓垎鏀枃妗堝拰閿欒璁℃暟閫昏緫銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸杩滅 `validateGraph(...)` 鐨勭姸鎬佹秷鎭嫾瑁呬篃鍒囧埌缁熶竴 facade锛岄伩鍏?controller 鍐嶆澶嶅埗瑙勫垯銆?- 鎵╁睍 `frontend-user/src/modules/graph/lib/graphFileImportExport.test.ts`锛岃ˉ榻愮粺涓€ facade 鐨?JSON/SVG 瀵煎嚭銆丣SON 闃绘柇瀵煎叆銆丮arkdown/Mermaid 褰掍竴鍖栧拰 validate 鐘舵€佹憳瑕佹祴璇曘€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphFileImportExport.test.ts` 鍏堝洜缁熶竴鎺ュ彛缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphImportExport.test.tsx src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/hooks/useGraphViewportCamera.test.tsx src/modules/graph/hooks/useGraphSelectionState.test.tsx src/modules/graph/lib/graphHistory.test.ts` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨瀵煎叆/瀵煎嚭/鏍￠獙鐜板湪宸茬粡鍏峰鍗曚竴鐨勫墠绔函閫昏緫鍏ュ彛锛屽悗缁?`WB-023` 鍙互鏇翠笓娉ㄥ湪 graph-core 搴忓垪鍖栥€佸鍏ラ敊璇€佹棫鏁版嵁鍏煎鍜屽巻鍙叉爤鍥炲綊娴嬭瘯锛岃€屼笉鏄户缁湪 hook/controller 涓拷韪垎鏀紓绉汇€?- 杩欐鏀跺彛涓昏鑱氱劍鎺ュ彛缁熶竴锛屾病鏈夌户缁墿寮犳柊鐨勫鍏ュ崗璁紱PlantUML / OpenAPI / SQL DDL 涔嬬被宸ョ▼鍥捐氨瀵煎叆浠嶅睘浜庡悗缁?`WB-051` 鍙婂叾鍓嶇疆宸ヤ綔銆?
## 2026-07-01 09:50:06 +08:00 | v1.1.0-alpha.69 | 瀹屾垚 WB-021 鍥捐氨 viewport / selection / history 鐘舵€佹娊绂?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-021`锛屾妸鍥捐氨宸ヤ綔鍖洪噷鍓╀綑鐨?selection / viewport / history 鐘舵€佽浆绉讳粠鈥滃墠绔?hook 鍚勮嚜缁存姢鈥濈户缁敹鍙ｅ埌 `@studymate/graph-core` 绾€昏緫杈圭晫銆?- 鏈疆閲嶇偣涓嶆墿寮?import/export 鎴栨寔涔呭寲鑳藉姏锛屽彧璁╅€夋嫨銆佸閫夈€佺缉鏀?閲嶇疆瑙嗛噹銆佹挙閿€/閲嶅仛杞崲鍏峰绋冲畾鐨勫叡浜姸鎬佹ā鍨嬩笌鍥炲綊娴嬭瘯銆?### 瀹屾垚缁撴灉
- 鏇存柊 `packages/graph-core/src/selection.ts`銆乣viewport.ts` 涓?`history.ts`锛屾柊澧?`replaceGraphNodeSelection(...)`銆乣zoomGraphViewport(...)`銆乣resetGraphViewport(...)`锛屽苟鎶?core history label/undo/redo 杞崲娓呯悊涓哄彲澶嶇敤瀹炵幇銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphSelectionState.ts`锛屽皢鏄惧紡澶氶€夋浛鎹€佸崟閫夈€乼oggle銆佹閫夌粺涓€濮旀墭缁?`@studymate/graph-core` selection helper锛屼笉鍐嶅垎鍒淮鎶ゆ暎钀界殑 `selectedNodeId` / `selectedNodeIds` 鍐欐硶銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphViewportCamera.ts`锛岃宸ュ叿鏍忕缉鏀俱€佹粴杞缉鏀惧拰閲嶇疆瑙嗛噹鍏ㄩ儴澶嶇敤 graph-core viewport transition helper銆?- 閲嶅啓 `frontend-user/src/modules/graph/lib/graphHistory.ts`锛岃鍓嶇 undo/redo/history 鎹曡幏鍖呰灞傚鎵樼粰 graph-core history state锛屽悓鏃朵繚鐣?StudyMate 鑷繁鐨?`GraphDocumentPayload` 瑙勮寖鍖栦笌淇濆瓨杈圭晫鎽樿銆?- 鏇存柊 graph-core 涓庡墠绔浘璋辨祴璇曪紝琛ラ綈鏄惧紡澶氶€夋浛鎹€乿iewport zoom/reset銆乭istory label 鍜?undo/redo 鍖呰灞傚洖褰掋€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?0 鏉?graph-core 鐢ㄤ緥鍏ㄧ豢銆?- `npm --workspace frontend-user run test -- src/modules/graph/hooks/useGraphSelectionState.test.tsx src/modules/graph/hooks/useGraphViewportCamera.test.tsx src/modules/graph/lib/graphHistory.test.ts` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖虹殑閫夋嫨銆佽閲庡拰鍘嗗彶鐘舵€佺幇鍦ㄥ凡缁忓叿澶囨洿鏄庣‘鐨勨€渃ore 鐘舵€佹満 + 鍓嶇鍖呰灞傗€濊竟鐣岋紝鍚庣画 `WB-022` 鍙互涓撴敞缁熶竴 import / export / validation锛岃€屼笉鏄户缁湪 controller 閲屽鍒剁姸鎬佽浆绉婚€昏緫銆?- 鏈疆椤烘墜娓呯悊浜?`graphHistory.ts` 鐨勫巻鍙蹭贡鐮佹爣绛撅紝浣嗘病鏈夋墿鏁ｅ埌鏇村ぇ鑼冨洿 UI 鏂囨锛涘叾浠栧浘璋辨棫鏂囨缂栫爜闂浠嶅簲鍦ㄧ嫭绔嬪伐浣滃寘閲屾湁璁″垝鏀跺彛銆?
## 2026-07-01 09:27:42 +08:00 | v1.1.0-alpha.68 | 瀹屾垚 WB-020 鍥捐氨鏂囨。妯″瀷涓庣増鏈瓥鐣ユ敹鍙?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-020`锛屾妸鍥捐氨 `GraphDocument` / `schemaVersion` / 鍏煎璇诲啓榛樿鍖栦粠鈥滃垎鏁ｅ湪鍓嶅悗绔澶勭‖缂栫爜鈥濇敹鍙ｆ垚鏄惧紡濂戠害銆?- 鏈疆閲嶇偣涓嶆墿寮?viewport/history/import-export 鏂拌兘鍔涳紝鍙ǔ瀹氭棫鍥捐氨 payload銆佺┖鏂囨。銆丮ongo current document 涓?snapshot 鐨勫吋瀹硅鍙栬矾寰勩€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphDocumentPayload.ts` 涓?`graphDocumentPayload.test.ts`锛屾妸鐢ㄦ埛绔浘璋?payload 鍏煎閫傞厤闆嗕腑璧锋潵锛屽苟澶嶇敤 `@studymate/graph-core` 鐨?`normalizeGraphDocument(...)` 涓?`supportedGraphSchemaVersion`銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`锛岃宸ヤ綔鍖?`normalizeDocument(...)` / `createEmptyDocument(...)` 缁熶竴濮旀墭缁欐柊鐨?payload 閫傞厤灞傦紝鑰屼笉鏄户缁湪椤甸潰渚ф暎钀?`schemaVersion: 1` 鍜岀┖瀵硅薄/绌烘暟缁勯粯璁ゅ€笺€?- 鏂板 `backend/internal/modules/graph/dto/document_contract.go` 涓?`document_contract_test.go`锛屾彁渚?`SupportedGraphSchemaVersion`銆乣NormalizeDocumentPayload(...)` 涓?`NewEmptyDocumentPayload(...)` 涓変釜鍏变韩濂戠害鍏ュ彛銆?- 鏇存柊鍚庣 graph repository/service/helpers锛歁ongo current document 涓?snapshot 璇诲嚭鍚庝細鍐嶆缁忚繃鍏变韩榛樿鍖栵紱鎵归噺淇濆瓨銆佸鍏ャ€佸揩鐓ф仮澶嶅拰绌烘枃妗ｅ垱寤轰篃閮藉鐢ㄥ悓涓€灞?helper锛屼笉鍐嶅悇鑷ˉ `SchemaVersion = 1`銆?- 鏂板 `docs/architecture/GRAPH_DOCUMENT_CONTRACT.md`锛屽苟鍚屾鏇存柊 `README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸 `WB-020` 鏍囪涓哄畬鎴愬苟鍒囨崲涓嬩竴浼樺厛绾у埌 `WB-021`銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/graph/lib/graphDocumentPayload.test.ts src/modules/graph/lib/graphWorkspaceLoadState.test.ts` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 鏉＄敤渚嬪叏缁裤€?- `cd backend && go test ./internal/modules/graph/dto ./internal/modules/graph/repository ./internal/modules/graph/service` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鏂囨。濂戠害鐜板湪宸茬粡鍏峰娓呮櫚鐨勫崟涓€鏉ユ簮鍜屾樉寮忓吋瀹瑰眰锛屽悗缁?`WB-021` 鍙互鏇翠笓娉ㄥ湪 viewport / selection / history 鐘舵€佹娊绂伙紝鑰屼笉鏄户缁湪璇诲啓榛樿鍊间笂鏉ュ洖淇ˉ銆?- 褰撳墠浠嶄繚鐣欏墠绔伐浣滃尯榛樿 viewport `{ x: 140, y: 120, zoom: 1 }` 涓庡悗绔┖鏂囨。 `{ x: 0, y: 0, zoom: 1 }` 鐨勮涔夊樊寮傦紝杩欐槸鏈夋剰淇濈暀鐨?UI/鎸佷箙鍖栬竟鐣岋紝涓嶅睘浜庢湰杞鍚堝苟鐨勮寖鍥淬€?
## 2026-07-01 09:11:18 +08:00 | v1.1.0-alpha.67 | 瀹屾垚 WB-014 鎼滅储鏂囨。涓庡洖褰掕褰曟敹鍙?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-014`锛屾妸 `/api/v1/search` 鐨勫綋鍓嶅绾︺€佹潈闄愮煩闃点€侀〉闈㈣竟鐣屽拰鑷姩鍖栭獙璇佸叆鍙ｉ泦涓矇娣€涓嬫潵銆?- 鏈疆閲嶇偣涓嶆槸缁х画鍔犳悳绱㈠姛鑳斤紝鑰屾槸鎶婂凡缁忔敹鍙ｇ殑鎼滅储鑳藉姏鍙樻垚鍚庣画鍙鐢ㄣ€佸彲杩借釜銆佸彲鎵ц鐨勫伐绋嬭祫浜с€?### 瀹屾垚缁撴灉
- 鏂板 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`锛岄泦涓褰曟悳绱?endpoint銆佹煡璇㈠弬鏁般€乬rouped payload銆佹潈闄?鍙鎬с€佹帓搴?鎽樿瑙勫垯锛屼互鍙婄敤鎴风 URL 绛涢€夊拰褰撳墠鎵规鍒嗛〉杈圭晫銆?- 鏇存柊 `package.json`锛屾柊澧?`test:search:frontend`銆乣test:search:backend`銆乣test:search:e2e` 鍜?`verify:search`锛屾妸鎼滅储涓撻」鍥炲綊浠庨浂鏁ｅ懡浠ゆ敹鍙ｆ垚鍥哄畾鍏ュ彛銆?- 鏇存柊 `README.md`銆乣docs/DEVELOPMENT.md`銆佽矾绾?鐗堟湰鏂囨。鍜屽彉鏇磋褰曪紝璁╀富鏂囨。鏄庣‘鐭ラ亾鎼滅储濂戠害鎬昏〃鍜?`npm run verify:search` 鐨勫瓨鍦ㄣ€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屽皢 `WB-014` 鏍囪涓哄畬鎴愶紝骞舵妸涓嬩竴浼樺厛绾у垏鍥?`WB-020` 鍥捐氨鏂囨。妯″瀷涓庣増鏈瓥鐣ャ€?### 楠岃瘉缁撴灉
- `npm run verify:search` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛堜粎瀛樺湪鏃㈡湁 CRLF 鎻愮ず锛屾棤 diff 閿欒锛夈€?- `npm run ci` 閫氳繃銆?### 鍚庣画褰卞搷
- 鎼滅储閾捐矾鐜板湪宸茬粡涓嶅彧鏄€滀唬鐮佸拰娴嬭瘯瀛樺湪鈥濓紝鑰屾槸鍏峰浜嗗崟鐐规枃妗ｅ拰鍥哄畾楠岃瘉鍛戒护锛涘悗缁敼 `SearchIndexer`銆佹悳绱㈤〉鎴栫煡璇嗛摼鎺ユ椂锛屾洿瀹规槗鍒ゆ柇鏈夋病鏈夊彂鐢熷绾︽紓绉汇€?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-020`锛屽紑濮嬫敹鍙ｅ浘璋?`GraphDocument` / schema version / 鐗堟湰绛栫暐杩欐潯涓荤嚎锛岃€屼笉鏄户缁湪鎼滅储灞傚仛閲嶅鏁寸悊銆?
## 2026-07-01 09:05:12 +08:00 | v1.1.0-alpha.66 | 瀹屾垚 WB-013 鎼滅储椤典綋楠屼笌椤甸潰绾у洖褰掕ˉ寮?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-013`锛屽湪涓嶄慨鏀?`/api/v1/search` grouped payload 濂戠害鐨勫墠鎻愪笅锛岃ˉ鐢ㄦ埛绔悳绱㈤〉鐨勭┖鎬併€侀敊璇€併€佺被鍨嬬瓫閫夈€佹潵婧愯烦杞拰鍒嗛〉鍥炲綊銆?- 鏈疆閲嶇偣鏀跺彛鈥滅湡瀹炲彲楠岃瘉鐨勯〉闈氦浜掆€濓紝涓嶅亣瑁呭悗绔凡缁忔敮鎸?offset/page 鍒嗛〉銆?### 瀹屾垚缁撴灉
- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`锛屾柊澧?URL 椹卞姩鐨?`types` 绫诲瀷绛涢€夛紝璁╅〉闈㈢姸鎬併€佸湴鍧€鏍忓拰 `searchAll(...)` 璇锋眰淇濇寔鍚屾銆?- 鏂板 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx`锛屾寜椤甸潰绾?TDD 鍥炲綊瑕嗙洊鏃犲叧閿瘝绌烘€併€佸悗绔敊璇€併€佺瓫閫夎姹傚舰鐘讹紝浠ュ強鏉ユ簮閾炬帴涓庡垎椤靛垏鎹€?- 鏇存柊鎼滅储椤电粨鏋滃睍绀猴細姣忕粍褰撳墠鎵规鏈€澶氳姹?`12` 鏉＄粨鏋滐紝骞舵寜姣忛〉 `4` 鏉″垏鎹紱鐣岄潰浼氭槑纭鏄庤繖鍙槸褰撳墠鎵规鍐呭垎椤碉紝涓嶄唬琛ㄥ悗绔凡鏈?offset/page 濂戠害銆?- 鏇存柊 `frontend-user/src/styles/search-review.css`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆佽矾绾?鐗堟湰鏂囨。鍜屽彉鏇磋褰曪紝鎶婃悳绱㈤〉鏈€鏂颁氦浜掕竟鐣屽啓鍥炴枃妗ｃ€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test` 閫氳繃锛?2 涓祴璇曟枃浠躲€?47 鏉＄敤渚嬪叏缁裤€?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛堜粎瀛樺湪鏃㈡湁 CRLF 鎻愮ず锛屾棤 diff 閿欒锛夈€?- `npm run ci` 閫氳繃銆?### 鍚庣画褰卞搷
- 鎼滅储椤电幇鍦ㄥ凡缁忓叿澶囨渶灏忓彲鐢ㄧ殑椤甸潰浜や簰鎶ゆ爮锛屽悗缁唬鐞嗕笉闇€瑕佸啀闈犳墜宸ョ偣鐐圭偣鍒ゆ柇绛涢€夈€佺┖鎬佸拰鏉ユ簮璺宠浆鏄惁閫€鍖栥€?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-014`锛屾妸鎼滅储 API / 椤甸潰浜や簰鐨勫綋鍓嶅绾︿笌楠岃瘉璁板綍缁х画娌夋穩鍒版枃妗ｄ笌鍥炲綊娓呭崟閲屻€?
## 2026-07-01 02:09:34 +08:00 | v1.1.0-alpha.65 | 瀹屾垚 WB-012 鎼滅储鏉冮檺涓庡彲瑙佹€ц繃婊よˉ寮?### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-012`锛屾妸 fallback 鎼滅储鐨勬潈闄?鍙鎬х害鏉熶粠鈥滆浠ｇ爜鎺ㄦ柇鈥濇敹鍙ｆ垚鍙洖褰掓祴璇曘€?- 鏈疆閲嶇偣瑕嗙洊鍖垮悕鐭矾銆乷wner 褰掑睘鍜屾湭鍙戝竷鍐呭杩囨护锛屼笉鏀瑰彉鎼滅储璺敱涓?grouped payload 缁撴瀯銆?### 瀹屾垚缁撴灉
- 鏇存柊 `backend/internal/modules/search/service/indexer.go`锛屾妸鏌ヨ鎷艰鎶芥垚绾?`searchQuerySpec`锛屼究浜庡湪涓嶈繛鎺ョ湡瀹炴暟鎹簱鐨勫墠鎻愪笅鍥炲綊鍚勭被鍨嬬粨鏋滅殑鍙鎬ф潯浠躲€?- 鏇存柊 `backend/internal/modules/search/service/indexer_test.go`锛屾柊澧炴潈闄愮煩闃垫祴璇曪細鍖垮悕璇锋眰浼氱洿鎺ョ煭璺?`note/graph/card`锛沗material/post` 缁х画鏄惧紡闄愬畾鍏紑鍐呭锛沗card` 浠呰繑鍥?owner 鑷繁鐨?`active` 鍗＄墖锛沗graph` 浠呰繑鍥?`active` 涓斺€渙wner 鎴?public鈥濈殑鍥捐氨銆?- 椤烘墜琛ヤ笂 graph 鎼滅储缂哄け鐨?`status = active` 杩囨护锛岄伩鍏嶆妸闈炴椿璺冨浘璋卞甫杩涙悳绱㈠€欓€夐泦銆?- 鏇存柊 `README.md`銆乣docs/DEVELOPMENT.md`銆佽矾绾?鐗堟湰鏂囨。鍜屾墽琛岃褰曪紝鎶婃悳绱㈡潈闄愮煩闃靛啓鍥炴枃妗ｏ紝鍑忓皯鍚庣画浠ｇ悊璇垽銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/search/service` 閫氳繃銆?- `go test ./internal/modules/search/...` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃銆?- `npm run ci` 閫氳繃銆?### 鍚庣画褰卞搷
- 鎼滅储鐜板湪涓嶄粎濂戠害绋冲畾銆佺粨鏋滆川閲忓彲鍥炲綊锛岃繛鏍稿績鏉冮檺鐭╅樀涔熷凡缁忚鏄惧紡閿佷綇锛涘悗缁彲浠ユ洿鏀惧績鍦扮户缁仛鐢ㄦ埛绔悳绱綋楠屽拰浜や簰鍥炲綊銆?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-013`锛岃ˉ鎼滅储椤电殑绌烘€併€侀敊璇€併€佺瓫閫変笌鏉ユ簮璺宠浆鍥炲綊銆?
## 2026-07-01 02:00:32 +08:00 | v1.1.0-alpha.64 | 瀹屾垚 WB-011 鑱氬悎鎼滅储缁撴灉璐ㄩ噺琛ュ己
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-011`锛屽湪涓嶆敼鎼滅储璺敱涓?grouped payload 缁撴瀯鐨勫墠鎻愪笅锛岃ˉ寮?fallback 鎼滅储鐨勭粍鍐呮帓搴忓拰鎽樿灞曠ず璐ㄩ噺銆?- 鏈疆閲嶇偣鍙敹鍙ｂ€滄爣棰樺懡涓紭鍏堚€濆拰鈥滄憳瑕佸彲璇婚瑙堚€濅袱鏉℃渶灏忚鍒欙紝涓嶅紩鍏ユ柊绱㈠紩寮曟搸锛屼篃涓嶆墿灞曞埌鏉冮檺鐭╅樀銆?### 瀹屾垚缁撴灉
- 鏇存柊 `backend/internal/modules/search/service/indexer.go`锛岃 MySQL fallback 鍏堟姄鍙栦竴灏忔壒鍊欓€夛紝鍐嶆寜鈥滄爣棰樺懡涓紭鍏堛€佹憳瑕佸懡涓涔嬧€濈殑瑙勫垯绋冲畾鎺掑簭锛屽悓绾х户缁繚鐣欐暟鎹簱杩斿洖鐨勬渶鏂伴『搴忋€?- 鏂板 `backend/internal/modules/search/service/indexer_test.go`锛岄€氳繃绾€昏緫娴嬭瘯閿佸畾鏍囬鍛戒腑浼樺厛瑙勫垯锛屼互鍙婇暱鎽樿鎶樺彔绌虹櫧骞惰鍓埌 160 涓瓧绗︿互鍐呯殑琛屼负銆?- 鎼滅储缁撴灉鎽樿鐜板湪浼氱粺涓€鍘嬫垚鍗曡棰勮锛岄伩鍏嶆妸鏁存甯栧瓙姝ｆ枃鎴栭暱鏂囨湰鍘熸牱鐏岃繘鎼滅储缁撴灉鍗＄墖銆?- 鏇存柊 `docs/DEVELOPMENT.md`銆乣README.md`銆佽矾绾?鐗堟湰鏂囨。鍜屾墽琛岃褰曪紝鎶婃悳绱㈢粨鏋滆川閲忚鍒欏啓鍥炴枃妗ｏ紝閬垮厤鍚庣画缁х画渚濊禆鈥滄洿鏂板€掑簭浣嗙浉鍏虫€т笉娓呮鈥濈殑闅愬惈琛屼负銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/search/service` 閫氳繃銆?- `go test ./internal/modules/search/...` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃銆?- `npm run ci` 閫氳繃銆?### 鍚庣画褰卞搷
- 鎼滅储 fallback 鐜板湪宸茬粡鍏峰鏇寸ǔ瀹氱殑缁勫唴鎺掑簭鍜屾洿鍙鐨勬憳瑕侀瑙堬紝鍚庣画缁х画琛ュ己鏃跺彲浠ユ妸閲嶇偣鏀惧湪鏉冮檺/鍙鎬х煩闃靛拰鏇村己鐨勭储寮曟娊璞★紝鑰屼笉鏄户缁慨鍩虹灞曠ず璐ㄩ噺銆?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-012`锛岀郴缁熻ˉ榻愮鏈夌瑪璁般€佺鏈夊浘璋卞拰鏈彂甯冨唴瀹圭殑鏉冮檺杩囨护娴嬭瘯銆?
## 2026-07-01 01:55:11 +08:00 | v1.1.0-alpha.63 | 瀹屾垚 WB-010 缁熶竴鎼滅储濂戠害鏀跺彛
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-010`锛屽湪鐜版湁 search module 鍩虹涓婂浐瀹氭悳绱㈠绾︼紝鑰屼笉鏄噸鍋氭悳绱㈡ā鍧椼€?- 鏈疆閲嶇偣鏀跺彛榛樿鍒嗙粍銆侀潪娉?`types` 鏍￠獙銆乣limit` 杈圭晫锛屼互鍙婂墠绔?DTO / 寮€鍙戞枃妗ｄ腑鐨勮繑鍥炲瓧娈佃涔夈€?### 瀹屾垚缁撴灉
- 鏇存柊 `backend/internal/modules/search/service/service.go` 涓?`handler.go`锛岃鐪佺暐 `types` 鎴栦紶绌哄€兼椂绋冲畾鍥為€€鍒?`material/post/note/graph/card` 浜旂粍榛樿鎼滅储锛涙湭鐭ョ被鍨嬩細鍦?service 灞傜洿鎺ヨ繑鍥?`400 invalid_search_type`锛屼笉鍐嶇户缁惤鍒?indexer銆?- 璋冩暣 `limit` 瑙勫垯锛氱己鐪佹垨闈炴硶鏃跺洖閫€鍒?`20`锛岃秴涓婇檺鏃堕挸鍒朵负 `50`锛岄伩鍏嶅ぇ椤靛弬鏁板張琚潤榛樻敹鍥炲埌榛樿鍊笺€?- 琛ュ厖鍚庣 `search/service`銆乣search/handler` 娴嬭瘯锛岃鐩栫┖ `types` 榛樿琛屼负銆侀潪娉曠被鍨嬬煭璺け璐ュ拰鍒嗛〉涓婇檺杈圭晫銆?- 鏇存柊 `frontend-user/src/api/types.ts`锛屾樉寮忓浐瀹?`SearchResult.type` 涓?`source` 鐨勮仈鍚堢被鍨嬶紱琛ュ厖 `searchShare.test.ts`锛岄攣瀹氱敤鎴风鍦ㄦ棤绫诲瀷绛涢€夋椂涓嶄細鍙戦€佺┖ `types=` 鍙傛暟銆?- 鏇存柊 `docs/DEVELOPMENT.md`銆乣README.md`銆佽矾绾?鐗堟湰鏂囨。鍜屾墽琛岃褰曪紝鏄庣‘ `source` 琛ㄧず鏉ユ簮鍩熻€屼笉鏄簳灞傚瓨鍌ㄥ紩鎿庛€?### 楠岃瘉缁撴灉
- `go test ./internal/modules/search/service` 閫氳繃銆?- `go test ./internal/modules/search/handler` 閫氳繃銆?- `go test ./internal/modules/search/...` 閫氳繃銆?- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃銆?- `npm run ci` 閫氳繃銆?### 鍚庣画褰卞搷
- 缁熶竴鎼滅储鐜板湪宸茬粡浠庘€滄湁鎺ュ彛鈥濊繘鍏モ€滃绾︾ǔ瀹氣€濋樁娈碉紝鍚庣画宸ヤ綔鍙互鏇磋仛鐒﹀湪缁撴灉璐ㄩ噺銆佹帓搴忚鍒欍€佹潈闄愯繃婊ゅ拰鐢ㄦ埛绔氦浜掑洖褰掞紝鑰屼笉鏄户缁慨璇锋眰杈圭晫婕傜Щ銆?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-011`锛岀户缁ˉ璧勬枡銆佺瑪璁般€佸浘璋便€佸笘瀛愬洓绫荤粨鏋滅殑鑱氬悎璐ㄩ噺涓庢憳瑕?鎺掑簭瑙勫垯銆?
## 2026-07-01 01:45:11 +08:00 | v1.1.0-alpha.62 | 瀹屾垚 WB-004 鐗堟湰涓庨噷绋嬬鏂囨。瀵归綈
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-004`锛屾妸澶栧眰鐗堟湰鏂囨。銆佸彂甯冩竻鍗曞拰鎵ц鏂囨。涓庡凡缁忓畬鎴愮殑 `WB-002`銆乣WB-003` 宸ョ▼鍩虹嚎閲嶆柊瀵归綈銆?- 涓嶆墿鏁ｅ埌鏂板姛鑳藉紑鍙戯紝鍙敹鍙?README銆丷OADMAP銆乂ERSION_PLAN銆丆HANGELOG銆乺elease checklist 涓庢墽琛岃褰曘€?### 瀹屾垚缁撴灉
- 鏇存柊 `README.md`锛岃ˉ璁?`WB-002` 鐨勯厤缃畨鍏ㄦ敹鍙ｃ€乣WB-003` 鐨勬渶灏?CI 璐ㄩ噺闂ㄧ銆佹樉寮?`MYSQL_DSN` / `JWT_SECRET` 瑕佹眰锛屼互鍙?Playwright 榛樿 preview 绔彛 `44173` / `44174`銆?- 鏇存柊 `docs/planning/ROADMAP.md` 涓?`docs/planning/VERSION_PLAN.md`锛屾妸閰嶇疆瀹夊叏銆丟o 鏍煎紡闂ㄧ銆侀厤缃畨鍏ㄥ洖褰掓鏌ュ拰褰撳墠瀹屾暣楠岃瘉鍩虹嚎鍐欏洖閲岀▼纰戞枃妗ｃ€?- 鏇存柊 `CHANGELOG.md` 涓?`docs/planning/versions/v1.0.0-release.md`锛屽悓姝?release gate銆佺幆澧冨彉閲忚姹傚拰 Playwright 绔彛绾﹀畾锛岄伩鍏嶅彂甯冩枃妗ｇ户缁粸鍚庝簬浠ｇ爜銆?- 鏇存柊 `docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屽皢 `WB-004` 鏍囪涓哄畬鎴愶紝骞舵妸涓嬩竴浼樺厛绾ч噸鏂版敹鍙ｅ埌 `WB-010` 缁熶竴鎼滅储濂戠害銆?### 楠岃瘉缁撴灉
- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃銆?- `npm run ci` 閫氳繃锛岀‘璁ゆ枃妗ｆ敹鍙ｅ悗褰撳墠榛樿楠岃瘉閾捐矾浠嶄繚鎸佸叏缁裤€?### 鍚庣画褰卞搷
- 鐜板湪澶栧眰璇存槑銆佸彂甯冩竻鍗曞拰鎵ц闈㈤兘宸茬粡涓庣湡瀹炲伐绋嬪熀绾垮悓姝ワ紝鍚庣画鎺ㄨ繘涓嶄細鍐嶈鈥滈厤缃畨鍏ㄦ湭鏀跺彛鈥濃€淐I 闂ㄧ鏈ˉ榻愨€濊繖绫昏繃鏈熸枃妗ｈ瀵笺€?- 涓嬩竴浼樺厛绾у簲鍒囨崲鍒?`WB-010`锛屽厛鍥哄畾缁熶竴鎼滅储濂戠害锛屽啀缁х画鍋氭潈闄愪笌鐢ㄦ埛绔洖褰掕ˉ寮恒€?
## 2026-07-01 01:37:48 +08:00 | v1.1.0-alpha.61 | 瀹屾垚 WB-003 鏈€灏?CI 璐ㄩ噺闂ㄧ琛ュ己
### 浠诲姟鍐呭
- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `WB-003`锛屽湪宸叉湁 GitHub Actions 鐨勫熀纭€涓婅ˉ鏈€灏忚川閲忛棬绂侊紝鑰屼笉鏄噸鍐欐暣鏉℃祦姘寸嚎銆?- 浼樺厛閿佷綇鏈€瀹规槗鍥為€€鐨勪袱绫婚棶棰橈細Go 鏈牸寮忓寲鏂囦欢鍜屽凡绂佺敤鐨勫嵄闄╅厤缃粯璁ゅ€笺€?### 瀹屾垚缁撴灉
- 鏂板 `scripts/check-go-format.mjs`锛屾樉寮忔鏌?`backend/` 涓嬪叏閮?Go 鏂囦欢鏄惁閫氳繃 `gofmt`銆?- 鏂板 `scripts/check-config-safety.mjs`锛屾鏌?`backend/internal/config/config.go`銆乣.env.example` 鍜?`docs/DEVELOPMENT.md` 涓槸鍚﹀洖閫€鍒板凡绂佺敤鐨勫嵄闄╅粯璁ゅ€笺€?- 鏇存柊鏍?`package.json`锛屾柊澧?`verify:backend:format`銆乣verify:config-safety`锛屽苟鎶婂畠浠撼鍏?`npm run lint`銆?- 鏇存柊 `.github/workflows/ci.yml`锛屽湪 typecheck 鍓嶆樉寮忓鍔?Go 鏍煎紡鍜岄厤缃畨鍏ㄦ鏌ユ楠ゃ€?- 瀵?`backend/` 鍏ㄩ噺 Go 鏂囦欢鎵ц `gofmt -w`锛屼慨澶嶄粨搴撲腑鍘熸湰灏卞瓨鍦ㄧ殑澶ф壒鏈牸寮忓寲鏂囦欢锛屼娇鏂伴棬绂佸彲瀹為檯閫氳繃銆?- 鏇存柊 `playwright.config.ts` 涓?`e2e/v1-admin-governance.spec.ts`锛屾妸 E2E preview 榛樿绔彛浠?4173/4174 鏀跺彛涓烘洿绋崇殑 44173/44174锛屽苟鏀寔鐜鍙橀噺瑕嗙洊锛岃В鍐冲綋鍓?Windows 鐜涓嬬殑 preview 缁戝畾澶辫触銆?- 鏇存柊 `docs/DEVELOPMENT.md`锛屽悓姝ユ柊鐨勯棬绂佽剼鏈拰 Playwright 榛樿绔彛銆?### 楠岃瘉缁撴灉
- `npm run verify:backend:format` 閫氳繃锛岀‘璁?138 涓?Go 鏂囦欢鍧囧凡婊¤冻 `gofmt`銆?- `npm run verify:config-safety` 閫氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥閫氳繃銆?- `npm run ci` 閫氳繃锛屽畬鏁磋鐩?lint銆乥uild銆乂itest銆乬raph-core銆丳laywright銆佸悗绔祴璇曚笌鏂囨。鏍￠獙銆?### 鍚庣画褰卞搷
- 鐜板湪 `gofmt` 涓庨厤缃畨鍏ㄥ凡缁忎粠鈥滅害瀹氣€濆彉鎴愪簡浼氶樆鏂?CI 鐨勬樉寮忛棬绂併€?- 涓嬩竴浼樺厛绾у簲杞埌 `WB-004`锛屾妸 README 鍜岄噷绋嬬鏂囨。涓庢湰杞凡缁忚惤鍦扮殑宸ョ▼鍩虹嚎缁х画瀵归綈銆?
## 2026-07-01 01:30:47 +08:00 | v1.1.0-alpha.60 | 瀹屾垚 WB-002 鐜鍙橀噺涓庡畨鍏ㄩ粯璁ゅ€兼敹鍙?### 浠诲姟鍐呭
- 娌跨潃 `CODEX_MASTER_PROMPT.md` 缁х画鎵ц `WB-002`锛屾敹鍙ｇ幆澧冨彉閲忓拰鍗遍櫓榛樿鍊硷紝涓嶆墿鏁ｅ埌涓氬姟鍔熻兘寮€鍙戙€?- 鐩爣鏄Щ闄ゅ彲鐩存帴杩愯鐨勬晱鎰?fallback锛屾槑纭紑鍙?娴嬭瘯/鐢熶骇鐨勬渶灏忛厤缃竟鐣岋紝骞惰鍚姩澶辫触淇℃伅鍙銆?### 瀹屾垚缁撴灉
- 鏇存柊 `backend/internal/config/config.go`锛岀Щ闄?`JWT_SECRET` 涓?`MYSQL_DSN` 鐨勫嵄闄?fallback锛屽苟鏂板 `ValidateMySQLConfig` 涓?`ValidateServerConfig`銆?- 鏂板 `backend/internal/config/config_test.go`锛岃鐩栧畨鍏ㄧ┖ fallback銆丮ySQL 蹇呭～鏍￠獙銆佸崰浣?JWT secret 鎷掔粷銆佺鐞嗗憳寮曞閰嶇疆瀹屾暣鎬х瓑鍦烘櫙銆?- 鏇存柊 `backend/internal/app/server.go`锛屽湪鏈嶅姟鍚姩鍓嶆樉寮忔牎楠?`MYSQL_DSN`銆乣JWT_SECRET` 鍜岀鐞嗗憳寮曞閰嶇疆銆?- 鏇存柊 `backend/cmd/migrate/main.go` 涓?`backend/cmd/backfill-note-documents/main.go`锛岃鏁版嵁搴撶浉鍏冲懡浠ゅ湪缂哄け鍏抽敭鐜鍙橀噺鏃剁洿鎺ュけ璐ワ紝骞惰緭鍑烘槑纭敊璇€?- 鏇存柊 `.env.example`锛屼繚鐣欏崰浣嶅瀷 `JWT_SECRET` 鎻愮ず锛岀Щ闄?root 寮卞彛浠?DSN 鍜岄粯璁ゅ惎鐢ㄧ殑绠＄悊鍛樺紩瀵艰处鍙枫€?- 鏇存柊 `docs/DEVELOPMENT.md`锛屾妸鍚庣鍚姩绀轰緥鏀逛负涓撶敤鏁版嵁搴撹处鍙蜂笌鏄惧紡鐜鍙橀噺鏂瑰紡锛屽苟琛ュ厖寮€鍙戙€佹祴璇曘€佺敓浜х幆澧冨垎灞傚缓璁€?### 楠岃瘉缁撴灉
- `gofmt -w backend/internal/config/config.go backend/internal/config/config_test.go backend/internal/app/server.go backend/cmd/migrate/main.go backend/cmd/backfill-note-documents/main.go` 閫氳繃銆?- `cd backend && go test ./internal/config` 閫氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `npm run typecheck` 閫氳繃銆?- `cd backend && $env:JWT_SECRET=''; $env:MYSQL_DSN=''; go run ./cmd/server` 鎸夐鏈熷け璐ワ紝鎶ラ敊 `MYSQL_DSN is required; JWT_SECRET is required`銆?- `cd backend && $env:MYSQL_DSN=''; go run ./cmd/migrate` 鎸夐鏈熷け璐ワ紝鎶ラ敊 `MYSQL_DSN is required`銆?### 鍚庣画褰卞搷
- 鏈湴鐜濡傛灉姝ゅ墠渚濊禆 `config.Load()` 鐨勯殣寮?fallback锛屽皢闇€瑕佹樉寮忚缃?`MYSQL_DSN` 鍜?`JWT_SECRET` 鍚庡啀鍚姩銆?- 褰撳墠涓嬩竴浼樺厛绾у簲杞悜 `WB-003`锛屽湪鐜版湁 CI 鍩虹涓婃樉寮忚ˉ `gofmt`銆乻ecret scan 鍜屾洿娓呮櫚鐨勮川閲忛棬绂併€?
## 2026-07-01 01:24:51 +08:00 | v1.1.0-alpha.59 | 瀹屾垚 WB-001 鍩虹嚎鏍搁獙涓庢墽琛屾枃妗ｆ敹鍙?### 浠诲姟鍐呭
- 鎸?`CODEX_MASTER_PROMPT.md` 鎵ц `WB-001`锛屽厛鏍搁獙褰撳墠鍒嗘敮鐪熷疄鍩虹嚎锛屽啀鍐冲畾鍚庣画宸ヤ綔鍖咃紝涓嶇洿鎺ヨ繘鍏ュぇ鑼冨洿鍔熻兘寮€鍙戙€?- 鍙厑璁镐慨鏀规墽琛屾枃妗ｅ拰 `.env.example` 鑽夋锛屼笉鏀瑰彉杩愯鏃朵笟鍔￠€昏緫銆?### 瀹屾垚缁撴灉
- 鏍搁獙鍑哄綋鍓嶄粨搴撳凡缁忕湡瀹炲叿澶?`search`銆乣share`銆佸悗鍙版不鐞?API銆丟itHub Actions CI銆乣@studymate/graph-core` 娴嬭瘯鍖咃紝浠ュ強宸叉媶钖勭殑 `frontend-user/src/app/App.tsx` 鍜?`frontend-admin/src/App.vue`銆?- 鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`锛岀籂姝ｂ€滄悳绱㈠悗绔己澶扁€濃€淐I 缂哄け鈥濃€滃墠绔牴鏂囦欢杩囧ぇ鈥濈瓑杩囨湡鍒ゆ柇銆?- 鏂板 `docs/engineering/WB-001_BASELINE_AUDIT.md`锛屽浐瀹?2026-07-01 鐨勭湡瀹炴瀯寤?娴嬭瘯鐭╅樀銆侀厤缃闄┿€佹枃妗ｆ紓绉诲拰鍚庣画鏂囦欢绾ц鍒掋€?- 鏇存柊 `docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屽皢鍚庣画閲嶇偣璋冩暣涓衡€滆ˉ寮虹幇鏈夎兘鍔涒€濊€屼笉鏄€滀粠闆跺垱寤鸿兘鍔涒€濓紝骞舵妸 `WB-001` 鏍囪涓哄凡鏍搁獙瀹屾垚銆?- 鏇存柊 `.env.example`锛岀Щ闄ゅ彲鐩存帴浣跨敤鐨?root 寮卞彛浠ょず渚嬶紝琛ュ叏 `MONGO_TIMEOUT`銆乣REDIS_TIMEOUT`銆乣NOTE_READ_MODEL` 绛夊綋鍓嶄唬鐮佸凡璇诲彇鐨勭幆澧冨彉閲忋€?### 楠岃瘉缁撴灉
- `npm run verify:docs` 閫氳繃銆?- `npm run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓敤渚嬮€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:user` 閫氳繃锛?1 涓枃浠躲€?42 涓敤渚嬮€氳繃銆?- `npm run test:admin` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run build:admin` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍚庣画 Codex 杩涘叆浠撳簱鏃讹紝灏嗕笉鍐嶈鈥滄悳绱㈡湭瀹炵幇鈥濃€淐I 鏈缓绔嬧€濃€淎pp 鏍规枃浠惰繃澶р€濈瓑杩囨湡鍒ゆ柇璇銆?- 褰撳墠鏈€搴斾紭鍏堟帹杩涚殑鏄?`WB-002` 鐜鍙橀噺涓庡畨鍏ㄩ粯璁ゅ€兼敹鍙ｏ紝浠ュ強 `WB-003` 鍦ㄧ幇鏈?CI 鍩虹涓婄殑璐ㄩ噺闂ㄧ琛ュ己銆?- `backend/internal/config/config.go` 涓殑鍗遍櫓 fallback 浠嶆湭绉婚櫎锛屼笅涓€宸ヤ綔鍖呴渶瑕佷紭鍏堝鐞嗐€?
## 2026-07-01 01:12:37 +08:00 | v1.1.0-alpha.58 | 宸ョ▼鍥捐妭鐐规敮鎸佺粨鏋勫寲妯″紡閫夋嫨
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鑷敱/UML/ERD/C4/娴佺▼鍥炬ā寮忚兘鍔涳紝鎶婂伐绋嬪浘鑺傜偣鐨?`diagramKind` 浠庤嚜鐢辨枃鏈緭鍏ュ崌绾т负缁撴瀯鍖栭€夋嫨銆?- 淇濇寔 `metadata.content.diagramKind` 浠嶄负瀛楃涓诧紝涓嶆敼 Graph API銆乣.smtg` 鍚堢害鎴栧悗绔ā鍨嬨€?### 瀹屾垚缁撴灉
- 鏂板 `GraphNodeMetadataEditorField` descriptor 绫诲瀷鍜?`graphDiagramModeOptions`锛屽浐瀹氭敮鎸?`free/uml/erd/c4/flowchart` 浜旂妯″紡銆?- 鏇存柊 `getGraphNodeMetadataEditorFields`锛屼负 `diagramKind` 杩斿洖鍙€夐」锛屽叾浠?URL銆佸浘鐗囥€丳DF銆佸涔犺妭鐐瑰瓧娈典繚鎸佸師杈撳叆妗嗚涓恒€?- 鏇存柊 `GraphWorkspaceSelectionPanel`锛屽甫 `options` 鐨?metadata 瀛楁娓叉煋涓洪敭鐩樺彲杈剧殑 `<select>`锛屽苟缁х画閫氳繃鐜版湁鍥炶皟鍐欏洖涓嶅彲鍙樻枃妗ｃ€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphNodeMetadata` 鍏堢孩锛屽け璐ュ師鍥犱负 `diagramKind` descriptor 缂哄皯浜旂妯″紡閫夐」銆?- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 鍏堢孩锛屽け璐ュ師鍥犱负宸ョ▼鍥剧被鍨嬩粛娓叉煋涓烘櫘閫?input銆?- `npm --workspace frontend-user run test -- graphNodeMetadata` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphNodeMetadata GraphWorkspaceSelectionPanel GraphWorkspacePage graphTemplateApplication graphNodeTypes` 閫氳繃锛? 涓枃浠躲€?6 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 宸ョ▼鍥捐妭鐐圭殑妯″紡 metadata 鐜板湪鍙ǔ瀹氱敤浜庢ā鏉裤€佸鍏ヨ崏绋垮拰鍚庣画妯″紡涓撳睘鏍￠獙锛岄伩鍏嶅ぇ灏忓啓鎴栦换鎰忔枃鏈鑷磋鍒欐紓绉汇€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-07-01 01:06:53 +08:00 | v1.1.0-alpha.57 | 宸ョ▼鍥炬ā鏉胯浆鎹负 Mermaid 瀵煎叆鑽夌
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 v0.8 妯℃澘涓績涓庡鍏ヨ崏绋胯兘鍔涳紝璁?`diagram` 妯″紡妯℃澘濂楃敤鍚庤繘鍏?Mermaid 鑽夌锛岃€屼笉鏄拰瀛︿範妯℃澘涓€鏍峰浐瀹氱敓鎴?Markdown 澶х翰銆?- 涓嶆敼鍙?`DiagramTemplatePayload`銆佸鍏?API 鎴?`.smtg` 鍚堢害锛屽彧鎷嗗嚭鍓嶇绾嚱鏁板苟璋冩暣 controller 缂栨帓銆?### 瀹屾垚缁撴灉
- 鏂板 `buildGraphTemplateImportDraft`锛屽涔犳ā鏉跨户缁緭鍑?Markdown 鏍囬澶х翰锛屽伐绋嬪浘妯℃澘鎸?`sampleLines` 绋冲畾鐢熸垚 `flowchart TD` Mermaid 杩炵嚎鑽夌銆?- 鏇存柊 `useGraphWorkspaceController.tsx` 鐨?`applyTemplate`锛屽彧娑堣垂绾嚱鏁拌繑鍥炵殑 `importMode/importSource/status`锛屽噺灏?controller 鍐呰仈鏍煎紡缁勮銆?- 琛ュ厖绾嚱鏁板拰 `GraphWorkspacePage` 娴嬭瘯锛岃鐩栧涔犳ā鏉?Markdown 鍥炲綊銆乁ML 妯℃澘 Mermaid 鑽夌銆佸鍏ユā寮忓垏鎹㈠拰鍙鐘舵€佹彁绀恒€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphTemplateApplication` 鍏堢孩锛屽け璐ュ師鍥犱负绾嚱鏁版ā鍧楀皻涓嶅瓨鍦ㄣ€?- `npm --workspace frontend-user run test -- GraphWorkspacePage` 鍏堢孩锛屽け璐ュ師鍥犱负宸ョ▼鍥炬ā鏉夸粛璧?Markdown 骞舵樉绀烘棫鐘舵€併€?- `npm --workspace frontend-user run test -- graphTemplateApplication` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspacePage` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphTemplateApplication GraphWorkspacePage GraphWorkspaceShell GraphWorkspaceImportPanel useGraphImportExport` 閫氳繃锛? 涓枃浠躲€?1 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 宸ョ▼鍥炬ā鏉跨幇鍦ㄥ凡浠庘€滃睍绀哄崱鈥濊繘鍏ョ幇鏈?Mermaid 瀵煎叆鑽夌閾捐矾锛屽悗缁彲缁х画琛?SQL/OpenAPI 鑽夌瑙ｆ瀽鍜屾ā寮忎笓灞炴牎楠屻€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:33:01 +08:00 | v1.1.0-alpha.56 | 澧炲己宸ョ▼鍥炬ā鏉夸腑蹇冧俊鎭?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 v0.8 宸ョ▼鍥捐兘鍔涳紝鍦ㄤ笉鏂板绔偣銆佷笉寮曞叆鏂板簱銆佷笉瀹炵幇 SQL/OpenAPI 瀵煎叆鐨勫墠鎻愪笅锛岃宸叉湁妯℃澘涓績鍏峰涓撲笟宸ョ▼鍥炬ā鏉垮拰鏇村彲璇荤殑棰勮淇℃伅銆?- 淇濇寔 `DiagramTemplatePayload` 鍚堢害涓嶅彉锛岀户缁€氳繃 `/diagram/templates` 杩斿洖妯℃澘鍒楄〃銆?### 瀹屾垚缁撴灉
- 鍦?`ListDiagramTemplates` 涓柊澧?UML 绫诲浘銆丒RD 鏁版嵁妯″瀷銆丆4 涓婁笅鏂囧浘鍜屾祦绋嬪浘 4 涓伐绋嬪浘妯℃澘锛宍mode` 浣跨敤 `diagram`锛宍category` 鍒嗗埆涓?`uml/erd/c4/flowchart`銆?- 鏇存柊 `GraphWorkspaceSourceRail` 妯℃澘鍗＄墖锛屽睍绀衡€滃涔犻棴鐜?宸ョ▼鍥?+ category鈥濈殑妯″紡鏍囩锛屽苟鏄剧ず鍓嶄笁鏉?`sampleLines` 楠ㄦ灦棰勮銆?- 琛ュ厖鍚庣 service 娴嬭瘯鍜屽墠绔?SourceRail 娴嬭瘯锛岃鐩栦笓涓氭ā鏉垮瓨鍦ㄣ€佸垎绫绘纭€佹牱渚嬬嚎涓嶅皯浜?4 鏉★紝浠ュ強鍓嶇妯″紡/棰勮灞曠ず鍜岀偣鍑诲鐢ㄥ洖璋冦€?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service` 鍏堢孩锛屽け璐ュ師鍥犱负宸ョ▼鍥炬ā鏉垮垪琛ㄤ负绌恒€?- `npm --workspace frontend-user run test -- GraphWorkspaceShell` 鍏堢孩锛屽け璐ュ師鍥犱负妯℃澘鍗℃湭鏄剧ず鈥滃伐绋嬪浘 / uml鈥濆拰鏍蜂緥楠ㄦ灦棰勮銆?- `go test ./internal/modules/graph/service` 閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `go test ./internal/modules/graph/...` 閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceShell GraphWorkspacePage graphNodeTypes graphNodeMetadata` 閫氳繃锛? 涓枃浠躲€?0 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 妯℃澘涓績鐜板湪鑳藉悓鏃舵湇鍔″涔犻棴鐜拰宸ョ▼鍥捐崏绋匡紝涓哄悗缁ā鏉垮簲鐢ㄧ敓鎴愬伐绋嬪浘鑺傜偣銆佸浘褰㈠簱闈㈡澘鍜?SQL/OpenAPI 瀵煎叆鑽夌鎵撳熀纭€銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:28:31 +08:00 | v1.1.0-alpha.55 | 鏀寔宸ョ▼鍥捐妭鐐瑰熀纭€鍒涘缓绫诲瀷
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 P1/P2 浜ょ晫鐨勫璞℃ā鍨嬫垚鐔熷害锛岃宸ョ▼鍥捐妭鐐逛笉鍙瓨鍦ㄤ簬瀵煎叆鎬?metadata 缂栬緫涓紝涔熻兘閫氳繃鐜版湁鍥捐氨宸ュ叿鏍忓垱寤恒€?- 涓嶅紩鍏ユā鏉夸腑蹇冦€佸浘褰㈠簱闈㈡澘銆丼QL/OpenAPI 瀵煎叆鎴栨柊鍚庣绔偣锛屽彧鎵╁睍褰撳墠鍓嶇鑺傜偣鍒涘缓绫诲瀷鍜?draft 閰嶇疆銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `GraphNodeCreationType`锛屾柊澧?`diagram`銆?- 鏇存柊 `graphNodeTypeOptions`锛屽湪鏂板缓鑺傜偣涓嬫媺妗嗕腑鍔犲叆鈥滃伐绋嬪浘鈥濓紝榛樿鏍囬涓衡€滃伐绋嬪浘鑺傜偣鈥濓紝灏哄涓?280 脳 160銆?- 琛ュ厖 `graphNodeTypes.test.ts` 鍜?`GraphWorkspaceShell.test.tsx`锛岃鐩栧伐绋嬪浘绫诲瀷鏆撮湶銆乨raft 鏋勫缓鍜屽伐鍏锋爮涓嬫媺鍥炶皟銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphNodeTypes GraphWorkspaceShell` 鍏堢孩锛屽け璐ュ師鍥犱负宸ョ▼鍥鹃€夐」缂哄け锛宍diagram` draft 鍥為€€涓烘蹇佃妭鐐广€?- `npm --workspace frontend-user run test -- graphNodeTypes GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphNodeTypes graphNodeMetadata GraphWorkspaceShell GraphWorkspaceSelectionPanel GraphWorkspacePage graphWorkspaceMutations` 閫氳繃锛? 涓枃浠躲€?1 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 宸ョ▼鍥捐妭鐐瑰凡杩涘叆鐜版湁鐢诲竷鍒涘缓鍏ュ彛锛屽苟鍙鐢ㄥ墠涓€闃舵鐨?`diagramKind/diagramShape/diagramSourceId` metadata 缂栬緫锛涘悗缁彲浠ョ户缁帹杩涙ā鏉夸腑蹇冦€佸浘褰㈠簱闈㈡澘鍜屽鍏ヨ崏绋挎牎楠屻€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:25:23 +08:00 | v1.1.0-alpha.54 | 淇濈暀鍥捐氨鍗＄墖鍐欏叆鐨勭粨鏋勫寲鏉ユ簮
### 浠诲姟鍐呭
- 缁х画瀹屽杽鍥捐氨鑺傜偣鐢熸垚鍗＄墖骞跺弬涓庡涔犵殑瀛︿範闂幆锛岃纭鍐欏叆澶嶄範鍗＄墖鏃讹紝鍗充娇鍥捐氨鑺傜偣娌℃湁鏄惧紡 `source`锛屼篃鑳戒粠缁撴瀯鍖?metadata 淇濈暀鏉ユ簮銆?- 涓嶆敼鍙?`CommitGraphCardDraftsRequest`銆乧ard API 鎴?`.smtg` 鍚堢害锛屽彧澧炲己鍚庣 create card request 鐨勬潵婧愭帹鏂€?### 瀹屾垚缁撴灉
- 鏂板 `inferCardSourceFromMetadata`锛屽湪 `BuildCardCreateRequests` 涓繚鐣欐樉寮?`node.Source` 浼樺厛绾э紱褰撴樉寮忔潵婧愮己澶辨椂锛屾寜 `noteId`銆乣cardId`銆乣materialId`銆乣aiDraftId`銆乣aiTaskId`銆乣diagramSourceId` 鎺ㄦ柇 `SourceType/SourceID`銆?- 琛ュ厖 service helper 娴嬭瘯锛岃鐩栬嚜鐢辨暣鐞嗙殑 `rich-note` 鑺傜偣鍙湁 `metadata.content.noteId` 鏃讹紝纭鍐欏叆鍗＄墖浠嶇敓鎴?`note/note-1` 鏉ユ簮銆?- 淇濇寔宸叉湁缂哄け鑺傜偣銆佺┖鐧借崏绋垮拰鏄惧紡鏉ユ簮淇濈暀琛屼负涓嶅彉銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service` 鍏堢孩锛屽け璐ュ師鍥犱负 metadata fallback 鏈疄鐜帮紝create request 鐨?`SourceType/SourceID` 涓虹┖銆?- `go test ./internal/modules/graph/service` 閫氳繃銆?- `go test ./internal/modules/graph/...` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 鍥捐氨鑺傜偣鐜板湪浠庘€滅敓鎴愬崱鐗囪崏绋库€濆埌鈥滅‘璁ゅ啓鍏ュ涔犲崱鐗団€濋兘鑳芥惡甯︽潵婧愮嚎绱紝鍚庣画鍙互缁х画鍋?UI 灞傚涔犲啓鍏ユ垚鍔熷悗鐨勫浘璋卞弽閾炬彁绀烘垨瀵煎叆鑽夌鏍￠獙灞曠ず銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:22:18 +08:00 | v1.1.0-alpha.53 | 璁╁浘璋卞崱鐗囪崏绋挎惡甯︾粨鏋勫寲鏉ユ簮绾跨储
### 浠诲姟鍐呭
- 缁х画鎵撻€氭潵婧愬弽閾俱€佺粨鏋勫寲 metadata 涓庡崱鐗囩敓鎴?澶嶄範纭娴侊紝璁╁浘璋辫妭鐐圭敓鎴愬崱鐗囪崏绋挎椂鑳藉甫鍑鸿祫鏂欍€佺瑪璁般€佸崱鐗囥€丄I 鑽夌鍜屽伐绋嬪浘瀵煎叆绛変笂涓嬫枃銆?- 涓嶆敼鍙?`/graphs/:id/ai/generate-cards` 璇锋眰鍚堢害銆丟raph API 鎴?`.smtg` 鏂囦欢鏍煎紡锛屽彧澧炲己鍚庣鑽夌瑙ｉ噴鏂囨銆?### 瀹屾垚缁撴灉
- 鏂板 `BuildCardDraftExplanation`锛屽湪淇濈暀鍘熸湁鍥哄畾璇存槑鐨勫熀纭€涓婏紝浠?`metadata.content` 鎸夌ǔ瀹氶『搴忔彁鍙?`materialId`銆乣materialUrl`銆乣noteId`銆乣cardId`銆乣deckId`銆乣aiDraftId`銆乣aiTaskId`銆乣diagramKind`銆乣diagramShape` 鍜?`diagramSourceId`銆?- 鏇存柊 `BuildCardDrafts`锛岀敓鎴?`GraphCardDraftPayload.explanation` 鏃惰拷鍔犫€滄潵婧愮嚎绱⑩€濓紝甯姪鐢ㄦ埛鍦ㄧ‘璁ゅ啓鍏ュ崱缁勫墠鐞嗚В鍗＄墖鑽夌鏉ヨ嚜鍝瀛︿範闂幆涓婁笅鏂囥€?- 琛ュ厖鍚庣 service helper 娴嬭瘯锛岄攣瀹氬崱鐗囪妭鐐圭殑 `cardId/deckId/aiDraftId` 浼氳繘鍏ヨ崏绋胯В閲婏紝閬垮厤缁撴瀯鍖?metadata 鍙仠鐣欏湪鍓嶇缂栬緫闈㈡澘銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/graph/service` 鍏堢孩锛屽け璐ュ師鍥犱负鑽夌 explanation 浠嶆槸鍥哄畾鏂囨锛屾湭鍖呭惈鈥滃崱鐗?ID card-1鈥濈瓑缁撴瀯鍖栫嚎绱€?- `go test ./internal/modules/graph/service` 閫氳繃銆?- `go test ./internal/modules/graph/...` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 鍥捐氨鑺傜偣鐨勭粨鏋勫寲 metadata 宸茶繘鍏ュ崱鐗囪崏绋跨‘璁ゆ祦锛屽悗缁彲浠ョ户缁妸澶嶄範鍐欏叆缁撴灉鍙嶉摼鍥炲浘璋憋紝鎴栦负瀵煎叆鑽夌鏍￠獙闈㈡澘灞曠ず杩欎簺鏉ユ簮绾跨储銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:16:44 +08:00 | v1.1.0-alpha.52 | 鎵╁睍鍥捐氨瀛︿範鑺傜偣缁撴瀯鍖?metadata 缂栬緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鑺傜偣瀵硅薄妯″瀷鍜岀紪杈戦潰鏉挎垚鐔熷害锛屽湪涓嶆敼鍙?Graph API 鍜?`.smtg` 鍚堢害鐨勫墠鎻愪笅锛岃璧勬枡銆佺瑪璁般€佸崱鐗囥€丄I 鑽夌/浠诲姟鍜屽鍏ユ€佸伐绋嬪浘鑺傜偣鍏峰缁撴瀯鍖?metadata 缂栬緫鍏ュ彛銆?- 淇濇寔鐜版湁 URL銆佸浘鐗囥€佸叕寮忋€丳DF 閿氱偣瀛楁琛屼负涓嶅彉锛屽苟缁х画閫氳繃涓嶅彲鍙樻洿鏂板啓鍏?`metadata.content`銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `GraphNodeMetadataField`锛屾柊澧?`materialId`銆乣materialUrl`銆乣noteId`銆乣cardId`銆乣deckId`銆乣aiDraftId`銆乣aiTaskId`銆乣diagramKind`銆乣diagramShape` 鍜?`diagramSourceId`銆?- 鏇存柊 `getGraphNodeMetadataEditorFields`锛屼负 `material`銆乣rich-note`銆乣card`銆乣ai` 鍜屽鍏ユ€?`diagram` 鑺傜偣杩斿洖绫诲瀷鍖栫紪杈戝瓧娈碉紱宸ョ▼鍥惧瓧娈靛彧鏀寔鑽夌/瀵煎叆鎬佺紪杈戯紝涓嶆柊澧炲垱寤烘祦绋嬫垨鍚庣绔偣銆?- 琛ュ己 `GraphWorkspaceSelectionPanel` 缁勪欢娴嬭瘯锛岀‘璁ゅ崱鐗囪妭鐐逛細灞曠ず鈥滃崱鐗?ID / 鍗＄粍 ID鈥濈紪杈戞锛屽苟鎶婂彉鏇村鎵樼粰鐜版湁 `onNodeMetadataFieldChange`銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphNodeMetadata` 鍏堢孩锛屽け璐ュ師鍥犱负瀛︿範鑺傜偣鍜?`diagram` 鑺傜偣浠嶈繑鍥炵┖缂栬緫瀛楁銆?- `npm --workspace frontend-user run test -- graphNodeMetadata` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphNodeMetadata GraphWorkspaceSelectionPanel GraphWorkspacePage graphSourceBacklinks` 閫氳繃锛? 涓枃浠躲€?2 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 瀛︿範闂幆鑺傜偣鐜板湪鍙互鍦ㄩ€変腑闈㈡澘涓淮鎶ゆ潵婧?鍗＄粍/AI 鑽夌绛夌粨鏋勫寲瀛楁锛屽悗缁彲缁х画鎶婅繖浜?metadata 涓庡崱鐗囩敓鎴愩€佸涔犵‘璁ゅ拰瀵煎叆鑽夌鏍￠獙闈㈡澘鎵撻€氥€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-30 20:12:21 +08:00 | v1.1.0-alpha.51 | 寮哄寲鍥捐氨鏉ユ簮鍙嶉摼瀛︿範闂幆鎻愮ず
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 P0 绋冲畾娌荤悊锛屽畬鍠勬潵婧愬弽閾惧拰瀛︿範闂幆锛岃璧勬枡銆丳DF 鎵规敞銆佺瑪璁般€佸崱鐗囥€丄I 鑽夌/浠诲姟鑺傜偣涓嶄粎鑳借烦鍥炴潵婧愶紝涔熻兘瑙ｉ噴褰撳墠澶勪簬瀛︿範闂幆鐨勫摢涓€姝ャ€?- 涓嶆敼鍙?Graph API銆乣.smtg` 鍚堢害鎴栧崱鐗囩敓鎴愭帴鍙ｏ紝鍙寮哄墠绔潵婧愬弽閾炬ā鍨嬪拰閫変腑鑺傜偣闈㈡澘灞曠ず銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `buildGraphSourceBacklink`锛屼负璧勬枡銆佺瑪璁般€佸崱鐗囥€佹壒娉ㄣ€丳DF 閿氱偣銆丄I 鑽夌鍜?AI 浠诲姟杩斿洖 `learningStepLabel` 涓?`description`锛岃ˉ鍏呪€滆祫鏂欓槄璇?/ 绗旇娌夋穩 / 鍗＄墖澶嶄範 / 璧勬枡鎵规敞 / PDF 閿氱偣 / AI 鑽夌纭 / AI 浠诲姟杩借釜鈥濈瓑瀛︿範闃舵銆?- 鍏煎 `ai-draft`銆乣ai_draft`銆乣ai-task`銆乣ai_task` 绛夋潵婧愮被鍨嬪埆鍚嶏紝閬垮厤瀵煎叆鎴?AI payload 浣跨敤涓嶅悓鍛藉悕鏃朵涪澶卞弽閾俱€?- 鏇存柊 `GraphWorkspaceSelectionPanel` 鐨勫崟鑺傜偣鏉ユ簮鍗＄墖锛屽睍绀烘潵婧愮被鍨嬨€佹潵婧?ID銆佸涔犻樁娈靛拰涓嬩竴姝ヨ鏄庯紝骞朵繚鐣欏師鏈夎烦杞寜閽紱鐜版湁鈥滅敓鎴愬崱鐗囪崏绋?/ 纭鍐欏叆鍗＄粍鈥濅粛鐢卞揩鐓т笌鑽夌闈㈡澘鎵挎帴銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphSourceBacklinks GraphWorkspaceSelectionPanel` 鍏堢孩锛屽け璐ュ師鍥犱负缂哄皯瀛︿範闃舵/璇存槑瀛楁锛屼笖 `ai-draft` 鍒悕鏈瘑鍒€?- `npm --workspace frontend-user run test -- graphSourceBacklinks GraphWorkspaceSelectionPanel` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspacePage GraphWorkspaceSourceSummary GraphWorkspaceRecoveryPanel graphSourceBacklinks GraphWorkspaceSelectionPanel` 閫氳繃锛? 涓枃浠躲€?0 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 閫変腑鑺傜偣闈㈡澘鐜板湪鑳芥妸鏉ユ簮璺宠浆鍜屽涔犻棴鐜覆璧锋潵锛屽悗缁彲浠ョ户缁墿灞曡妭鐐瑰璞℃ā鍨嬪拰缂栬緫闈㈡澘锛岃 URL銆佸浘鐗囥€佸叕寮忋€丳DF 閿氱偣銆佸崱鐗囥€佽祫鏂欍€佺瑪璁般€丄I 鑽夌鍜屽伐绋嬪浘鑺傜偣淇濇寔鏇寸粺涓€鐨勭粨鏋勫寲 metadata銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-12 01:22:43 +08:00 | v1.1.0-alpha.50 | 澧炲己鍥捐氨鍘嗗彶涓庝繚瀛樿竟鐣屾憳瑕?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 P0 绋冲畾娌荤悊锛屽己鍖?autosave/dirty/pending/saved/failed 涓?Undo/Redo 杈圭晫鐨勫彲瑙ｉ噴鎬с€?- 涓嶆敼鍙?Graph API銆乣.smtg` 鍚堢害鎴栧悗绔繚瀛橀€昏緫锛屽彧涓哄墠绔伐浣滃尯鎻愪緵绋冲畾鐨勫巻鍙茶竟鐣屾憳瑕侊紝璁╀繚瀛樸€佸鍏ャ€佹仮澶嶃€佹ā鏉垮簲鐢ㄧ瓑鍘嗗彶鐐硅兘鍦ㄦ不鐞嗛潰鏉夸腑琚В閲娿€?### 瀹屾垚缁撴灉
- 鏂板 `buildGraphHistoryBoundarySummary`锛屽皢 `history.lastLabel`銆乽ndo/redo 鏁伴噺鍜屽綋鍓?saveState 杞崲涓哄彲璇荤殑鏈€杩戝巻鍙茬偣銆佷繚瀛樿竟鐣屽拰椋庨櫓鎻愮ず銆?- 鎵╁睍 `buildGraphSettingsSections` 鐨?autosave 鍖哄煙锛屽睍绀烘渶杩戝巻鍙茬偣銆佸巻鍙茶竟鐣屽拰 Undo/Redo 鐘舵€併€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛屾妸褰撳墠 `historyState` 鍜?`saveState` 浼犲叆璁剧疆闈㈡澘锛屼繚鎸佺幇鏈変繚瀛樸€佸鍏ャ€佹仮澶嶅拰鎾ら攢/閲嶅仛琛屼负涓嶅彉銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel` 鍏堢孩锛屽け璐ュ師鍥犱负缂哄皯 `buildGraphHistoryBoundarySummary`锛屼笖 autosave 璁剧疆鍖烘湭灞曠ず鏈€杩戝巻鍙茬偣銆?- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphHistory graphSettingsPanel GraphWorkspacePanels GraphWorkspacePage useGraphWorkspacePersistence` 閫氳繃锛? 涓枃浠躲€?3 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 璁剧疆闈㈡澘鐜板湪鑳藉悓鏃惰В閲婁繚瀛樼姸鎬佸拰鍘嗗彶杈圭晫锛屽悗缁彲浠ョ户缁畬鍠勬潵婧愬弽閾句笌瀛︿範闂幆锛屾妸鍥捐氨鑺傜偣鍒板崱鐗囩敓鎴?澶嶄範纭娴佸仛鎴愭洿寮虹殑绔埌绔綋楠屻€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-12 01:16:12 +08:00 | v1.1.0-alpha.49 | 寮哄寲鍥捐氨鏍￠獙闈㈡澘瑙ｉ噴淇℃伅
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 P0 绋冲畾娌荤悊锛屽己鍖?GraphWorkspace validation panel锛岃瀛ょ珛鑺傜偣銆佺己鏉ユ簮銆侀噸澶嶆爣棰樸€佹偓鎸傝竟銆佽法鎶樺彔鍒嗙粍杈广€佺┖鍒嗙粍銆侀潪娉曞昂瀵搞€佹棤鏁堟潵婧?target 鍜屽鐩爣杈瑰紓甯哥瓑闂鍏峰鍙瑙ｉ噴銆?- 涓嶆敼鍙樺悗绔牎楠屻€丟raph API 鎴?`.smtg` 鍚堢害锛屽彧澧炲己鐢ㄦ埛绔鍒欒В閲娿€佷弗閲嶇骇璇存槑銆佸畾浣嶆彁绀哄拰淇寤鸿銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `frontend-user/src/modules/graph/lib/graphValidationPanel.ts`锛屼负鐜版湁鏍￠獙 ruleType 澧炲姞涓枃瑙勫垯鍚嶃€乻everity 鏂囨銆佸奖鍝嶈鏄庛€乼arget 鎽樿鍜屼慨澶嶅缓璁紝骞朵繚鐣欐湭鐭ヨ鍒?fallback銆?- 鏇存柊 `GraphValidationIssueList`锛岃鍒欐眹鎬绘樉绀轰腑鏂囧悕绉帮紝鍗曟潯闂鏄剧ず鈥滃畾浣?/ 褰卞搷 / 淇寤鸿鈥濓紝璁╁鍏ュけ璐ュ拰鏍￠獙澶辫触鏇村彲瑙ｉ噴銆?- 鏇存柊 `GraphWorkspacePanels.test.tsx`銆乣GraphWorkspaceImportPanel.test.tsx` 鍜?`graphValidationPanel.test.ts`锛岃鐩栬鍒欒В閲娿€佷骇鍝佸寲瑙勫垯娓呭崟銆佸鍏ラ潰鏉挎牎楠屽睍绀哄拰绌烘€佸洖褰掋€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels` 鍏堢孩锛屽け璐ュ師鍥犱负闈㈡澘浠嶆樉绀哄師濮?`ruleType`锛岀己灏戜腑鏂囪鍒欏悕銆佸奖鍝嶅拰淇寤鸿銆?- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphValidationPanel GraphWorkspacePanels GraphWorkspacePage graphFileImportExport GraphWorkspaceImportPanel` 閫氳繃锛? 涓枃浠躲€?3 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 鏍￠獙闈㈡澘宸蹭粠鍘熷瑙勫垯鍒楄〃鍗囩骇涓哄彲瑙ｉ噴娌荤悊闈㈡澘锛屽悗缁彲浠ョ户缁帹杩?autosave/dirty/pending/saved/failed 涓?Undo/Redo 杈圭晫纭寲銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-12 01:08:52 +08:00 | v1.1.0-alpha.48 | 寮哄寲鍥捐氨璁剧疆闈㈡澘娌荤悊淇℃伅
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 P0 绋冲畾娌荤悊锛屽湪涓嶆敼鍙?Graph API 鍜?`.smtg` 鍚堢害鐨勫墠鎻愪笅锛屾妸 GraphWorkspace 璁剧疆闈㈡澘浠庤鏄庢竻鍗曞寮轰负鏇存竻鏅扮殑宸ヤ綔鍖烘不鐞嗗尯鍩熴€?- 鑱氱劍鏄剧ず鍋忓ソ銆佸鍏ュ鍑恒€乤utosave 鐘舵€佸拰澶у浘鎬ц兘鎻愮ず锛岃澶辫触瀵煎叆/瀵煎嚭銆乸ending/failed 淇濆瓨鍜?200/300/20 鍩哄噯瑙勬ā鍏峰鍙В閲婃枃妗堛€?### 瀹屾垚缁撴灉
- 鎵╁睍 `frontend-user/src/modules/graph/lib/graphSettingsPanel.ts`锛屼负姣忎釜璁剧疆鍒嗗尯澧炲姞 `summary` 鍜?`actions`锛岃鐩栧皬鍦板浘銆佹潵婧愭吵閬撱€佸揩鎹烽敭銆丣SON 鏍￠獙銆佸鍏ュけ璐ヤ繚鐣欏綋鍓嶇敾甯冦€佸鍑哄け璐ョ姸鎬佸洖鍐欍€乨irty/pending/failed 淇濆瓨娌荤悊鍜屽ぇ鍥炬暣鐞嗗缓璁€?- 鏇存柊 `GraphSettingsPanel` 娓叉煋鎽樿鍜岀姸鎬佹爣绛撅紝璁╄缃潰鏉挎洿娓呮鍦板尯鍒嗘樉绀恒€佸鍏ュ鍑恒€佽嚜鍔ㄤ繚瀛樸€佹€ц兘鍜屽揩鎹烽敭鍖哄煙銆?- 琛ュ己 `graphSettingsPanel.test.ts` 鍜?`GraphWorkspacePanels.test.tsx`锛岄攣瀹?failed/pending 淇濆瓨鐘舵€併€佸ぇ鍥炬€ц兘寤鸿銆佸鍏ュ鍑哄け璐ヨВ閲婂拰璁剧疆鏍囩娓叉煋銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphSettingsPanel` 鍏堢孩锛屽け璐ュ師鍥犱负璁剧疆鍒嗗尯缂哄皯 `summary/actions` 鍜?failed/pending 淇濆瓨娌荤悊璇箟銆?- `npm --workspace frontend-user run test -- graphSettingsPanel GraphWorkspacePanels` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphSettingsPanel GraphWorkspacePanels GraphWorkspacePage GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€?6 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run verify:docs` 閫氳繃銆?- `git diff --check` 閫氳繃锛屼粎鏈夋棦鏈?CRLF 鎻愮ず銆?### 鍚庣画褰卞搷
- 璁剧疆闈㈡澘宸叉洿鎺ヨ繎 Project Graph 绾у伐浣滃尯娌荤悊鍏ュ彛锛屽悗缁彲浠ョ户缁己鍖?validation panel 鐨勮鍒欎腑鏂囧悕銆佷弗閲嶇骇璇存槑銆佸畾浣嶅姩浣滃拰淇寤鸿銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-12 01:02:24 +08:00 | v1.1.0-alpha.47 | 鎷嗗嚭鍥捐氨鑺傜偣杩炵嚎鍒嗙粍 mutation
### 浠诲姟鍐呭
- 浠?P0 绋冲畾娌荤悊寮€濮嬶紝缁х画鎷?`useGraphWorkspaceController.tsx` 涓殑 node/edge/group 鏂板銆佸垹闄ゃ€佸鍒躲€佽繛绾裤€佸垎缁勫拰鎶樺彔 mutation銆?- 淇濇寔鐜版湁 React + Vite + TypeScript銆乣@studymate/graph-core`銆丟raph API 鍜?`.smtg` 鍚堢害涓嶅彉锛屽彧鎶婂伐浣滃尯閫夋嫨鎬併€乭istory label銆乻tatus 鏂囨鍜屼笉鍙彉鏇存柊灏佽鍒板墠绔函鍑芥暟銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphWorkspaceMutations.ts`锛屾彁渚涘垱寤鸿妭鐐广€佸垱寤鸿繛绾裤€佸垹闄ら€変腑鑺傜偣/杩炵嚎銆佸垹闄ゅ彸閿妭鐐广€佸鍒惰妭鐐广€佸垱寤哄垎缁勫拰鍒囨崲鍒嗙粍鎶樺彔鐨勫伐浣滃尯 mutation 缁撴灉銆?- 鏂板 `graphWorkspaceMutations.test.ts`锛岃鐩栨柊澧炶妭鐐广€佽繛绾垮幓閲嶅け璐ヨВ閲娿€佸垹闄よ妭鐐规竻鐞嗚竟鍜屽垎缁勩€佸垹闄よ繛绾裤€佸鍒惰妭鐐?metadata 娣辨嫹璐濄€佸崟/澶氳妭鐐瑰垎缁勫拰鎶樺彔 no-op銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀浉鍏冲姩浣滄敼涓鸿皟鐢ㄧ函鍑芥暟锛屽苟閫氳繃缁熶竴 `applyWorkspaceMutation` 鍚屾鏂囨。銆侀€夋嫨鎬併€佽繛绾挎ā寮忋€侀€変腑杈瑰拰鐘舵€佹枃妗堬紱鏈疆缁熻浠庣害 1603 琛屼笅闄嶅埌 1596 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphWorkspaceMutations` 鍏堢孩锛屽け璐ュ師鍥犱负 `graphWorkspaceMutations` 妯″潡灏氫笉瀛樺湪銆?- `npm --workspace frontend-user run test -- graphWorkspaceMutations` 缁匡紝1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphWorkspaceMutations GraphWorkspacePage useGraphKeyboardActions useGraphContextMenu` 閫氳繃锛? 涓枃浠躲€?9 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run build:user` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鑺傜偣/杩炵嚎/鍒嗙粍鐨勬牳蹇冨伐浣滃尯鍙樻洿宸叉湁鐙珛绾嚱鏁板拰 immutability 鍥炲綊锛屽悗缁彲浠ョ户缁妸 settings panel銆乿alidation panel銆乤utosave/history 杈圭晫鎸夊悓鏍?TDD 灏忓垏鐗囨帹杩涖€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆丆RDT銆乄ebGL/Pixi銆乀auri 妗岄潰绔€丳roject Graph `.prg` 鍏煎鎴栨彃浠跺競鍦恒€?
## 2026-06-06 18:32:23 +08:00 | v1.1.0-alpha.46 | 鎷嗗嚭鍥捐氨鎵归噺鏍峰紡鍙樻洿閫昏緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鍜?Project Graph 绾ф壒閲忕紪杈戜綋楠岋紝鎶婇€変腑鑺傜偣棰滆壊銆佸己璋冨拰灏哄 preset 鐨勬壒閲?mutation 浠?`useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁 tone銆乪mphasis銆乻ize preset 璇箟銆佹湭閫変腑鑺傜偣寮曠敤涓嶅彉鍜屼笉鍙彉鏇存柊琛屼负锛屼笉鏀?Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphBatchAppearance.ts`锛屾彁渚?`applyGraphBatchTone`銆乣applyGraphBatchEmphasis` 鍜?`applyGraphBatchSizePreset` 绾嚱鏁般€?- 鏂板 `graphBatchAppearance.test.ts`锛岃鐩栨壒閲?tone銆佹壒閲?emphasis 淇濈暀宸叉湁 tone銆佹壒閲忓昂瀵?preset锛屼互鍙婃湭閫変腑鑺傜偣寮曠敤涓嶅彉銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱旀壒閲忔牱寮?map 閫昏緫锛沜ontroller 浠?1488 琛岀户缁笅闄嶅埌 1486 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphBatchAppearance` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphBatchAppearance GraphWorkspaceSelectionPanel GraphWorkspacePage` 閫氳繃锛? 涓枃浠躲€?4 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?9 涓敤鎴风娴嬭瘯鏂囦欢銆?21 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鎵归噺澶栬缂栬緫宸叉垚涓哄彲娴嬭瘯绾€昏緫锛屽悗缁彲浠ョ户缁媶 node/edge/group mutations锛屽寘鎷柊澧炪€佸垹闄ゃ€佸鍒躲€佸垎缁勩€佹姌鍙犲拰杩炵嚎銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 13:30:59 +08:00 | v1.1.0-alpha.45 | 鎷嗗嚭鍥捐氨鏉ユ簮娉抽亾鏂囨。鍙樻洿閫昏緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鍜屽涔犻棴鐜潵婧愮粍缁囪兘鍔涳紝鎶婃潵婧愭吵閬撶敓鎴愬悗鐨勮妭鐐逛綅缃€佺敓鎴愬垎缁勬浛鎹㈠拰閫夋嫨鎬佸洖鍐欎粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁鏉ユ簮娉抽亾甯冨眬銆佹棫鐢熸垚娉抽亾鏇挎崲銆佹墜鍔ㄥ垎缁勪繚鐣欍€佺敓鎴愬垎缁?metadata銆佽妭鐐瑰紩鐢ㄤ繚鐣欏拰涓嶅彲鍙樻洿鏂拌涓猴紝涓嶆敼 Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphSourceSwimlanes.ts`锛屾彁渚?`buildGraphSourceSwimlaneDocument` 绾嚱鏁帮紝灏佽 graph-core 娉抽亾甯冨眬鍒板墠绔枃妗ｅ彉鏇寸殑鏄犲皠銆?- 鏂板 `graphSourceSwimlanes.test.ts`锛岃鐩栫敓鎴愭潵婧愭吵閬撱€佹浛鎹㈤噸鍙犳棫鐢熸垚娉抽亾銆佷繚鐣欐墜鍔ㄥ垎缁勩€佷繚鐣欐湭閫変腑鑺傜偣寮曠敤锛屼互鍙婇€変腑鑺傜偣涓嶈冻鏃惰繑鍥炲師鏂囨。銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱旀潵婧愭吵閬?layoutNodes銆佹棫娉抽亾杩囨护鍜?group payload 澶嶅埗閫昏緫锛沜ontroller 浠?1505 琛岀户缁笅闄嶅埌 1488 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphSourceSwimlanes` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphSourceSwimlanes graphSourceLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 閫氳繃锛? 涓枃浠躲€?6 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?8 涓敤鎴风娴嬭瘯鏂囦欢銆?18 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鏉ユ簮鏁寸悊銆佹潵婧愬垎缁勫拰鏉ユ簮娉抽亾宸插舰鎴愯繛缁殑鍙祴璇曟潵婧愮粍缁囬€昏緫锛屽悗缁彲浠ョ户缁媶鎵归噺鏍峰紡鍜?node/edge/group mutations銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 13:21:03 +08:00 | v1.1.0-alpha.44 | 鎷嗗嚭鍥捐氨鏉ユ簮甯冨眬涓庡垎缁勯€昏緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鍜屽涔犻棴鐜暣鐞嗚兘鍔涳紝鎶婃寜鏉ユ簮绫诲瀷鍒嗗垪/鍒嗚鏁寸悊銆佹潵婧愬垎缁勭敓鎴愮殑鍧愭爣鍜屽垎缁勮绠椾粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁鏉ユ簮 bucket 椤哄簭銆佹潵婧愭爣绛炬帓搴忋€佹湭閫変腑鑺傜偣涓嶅彉銆佹潵婧愬垎缁勬爣棰樸€佺敾甯冭竟鐣?clamp 鍜屼笉鍙彉鏇存柊琛屼负锛屼笉鏀?Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphSourceLayout.ts`锛屾彁渚?`organizeGraphNodesBySource` 鍜?`buildGraphSourceGroups` 绾嚱鏁般€?- 鏂板 `graphSourceLayout.test.ts`锛岃鐩栨寜鏉ユ簮绫诲瀷鍒嗗垪銆佹寜鏉ユ簮绫诲瀷鍒嗚銆佹湭閫変腑鑺傜偣寮曠敤涓嶅彉銆佸師鑺傜偣涓嶅彉锛屼互鍙婃潵婧愬垎缁勮竟鐣屽拰 `makeGroupId`銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱旀潵婧愭暣鐞?placement銆佹潵婧愬垎缁?bounds 鍜?group payload 鐢熸垚閫昏緫锛沜ontroller 浠?1576 琛岀户缁笅闄嶅埌 1505 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphSourceLayout` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphSourceLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 閫氳繃锛? 涓枃浠躲€?4 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?7 涓敤鎴风娴嬭瘯鏂囦欢銆?16 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鏉ユ簮鏁寸悊涓庢潵婧愬垎缁勫凡鎴愪负鍙祴璇曠函閫昏緫锛屽悗缁彲浠ョ户缁媶鏉ユ簮娉抽亾鐢熸垚銆佹壒閲忔牱寮忓拰 node/edge/group mutations銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 13:11:46 +08:00 | v1.1.0-alpha.43 | 鎷嗗嚭鍥捐氨閫変腑鑺傜偣甯冨眬閫昏緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鍜?Project Graph 绾ф壒閲忕紪杈戜綋楠岋紝鎶婇€変腑鑺傜偣瀵归綈涓庡潎鍒嗙殑鍧愭爣璁＄畻浠?`useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁宸﹀榻愩€侀《閮ㄥ榻愩€佹按骞冲眳涓€佸瀭鐩村眳涓€佹按骞?鍨傜洿鍧囧垎銆佺敾甯冭竟鐣?clamp 鍜屼笉鍙彉鏇存柊琛屼负锛屼笉鏀?Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphSelectionLayout.ts`锛屾彁渚?`alignSelectedGraphNodes` 鍜?`distributeSelectedGraphNodes` 绾嚱鏁般€?- 鏂板 `graphSelectionLayout.test.ts`锛岃鐩栧榻愪笉淇敼鏈€変腑鑺傜偣銆佸眳涓榻愯竟鐣?clamp銆佹按骞冲潎鍒嗙ǔ瀹氶『搴忥紝浠ュ強閫変腑鏁伴噺涓嶈冻鏃惰繑鍥炲師鑺傜偣鏁扮粍銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱斿榻?鍧囧垎鍧愭爣璁＄畻鍜岃妭鐐?map 鍙樻洿閫昏緫锛沜ontroller 浠?1643 琛岀户缁笅闄嶅埌 1576 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphSelectionLayout` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphSelectionLayout GraphWorkspaceSelectionPanel GraphWorkspacePage` 閫氳繃锛? 涓枃浠躲€?5 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?6 涓敤鎴风娴嬭瘯鏂囦欢銆?13 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 閫変腑鑺傜偣甯冨眬缂栬緫宸叉垚涓哄彲娴嬭瘯绾€昏緫锛屽悗缁彲浠ョ户缁媶鎸夋潵婧愭暣鐞嗐€佹潵婧愬垎缁勩€佹壒閲忔牱寮忓拰 node/edge/group mutations銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 13:03:53 +08:00 | v1.1.0-alpha.42 | 鎷嗗嚭鍥捐氨鎷栧姩鏂囨。鍙樻洿閫昏緫
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鍗曡妭鐐?澶氳妭鐐规嫋鍔ㄦ椂鐨勫潗鏍囪绠椼€佸惛闄勮緟鍔╃嚎銆佽竟鐣?clamp 鍜屼笅涓€鐗堣妭鐐瑰垪琛ㄧ敓鎴愪粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁鎷栧姩鏃朵笉璁板綍 history銆佺姸鎬佹彁绀恒€乿iewport zoom delta銆佸榻愬惛闄勩€侀殣钘忚妭鐐硅繃婊ゅ拰涓嶅彲鍙樻洿鏂拌涓猴紝涓嶆敼 Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphDragMove.ts`锛屾彁渚?`buildGraphDragMove` 绾嚱鏁帮紝缁熶竴杩斿洖 `nodes`銆乣alignmentGuides` 鍜屾嫋鍔ㄧ姸鎬佹枃妗堛€?- 鏂板 `graphDragMove.test.ts`锛岃鐩栧崟鑺傜偣鎸?viewport zoom 绉诲姩涓斾笉淇敼鍘熸枃妗ｃ€佸鑺傜偣鎸?origins 绉诲姩骞?clamp 鍒扮敾甯冭竟鐣屻€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱斿崟鑺傜偣/澶氳妭鐐规嫋鍔ㄥ潗鏍囪绠椼€佸惛闄勮绠楀拰鑺傜偣 map 鍙樻洿閫昏緫锛沜ontroller 浠?1689 琛岀户缁笅闄嶅埌 1643 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- graphDragMove` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- graphDragMove useGraphDragState GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 閫氳繃锛? 涓枃浠躲€?9 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?5 涓敤鎴风娴嬭瘯鏂囦欢銆?09 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鑺傜偣鎷栧姩鐨勬枃妗ｅ彉鏇村凡缁忔垚涓哄彲娴嬭瘯绾€昏緫锛屽悗缁彲浠ョ户缁媶 pan/marquee pointer effect銆佽妭鐐?杈?鍒嗙粍 mutations 鍜屾嫋鍔ㄦ€ц兘鑺傛祦銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 12:55:35 +08:00 | v1.1.0-alpha.41 | 鎷嗗嚭鍥捐氨鎷栨嫿鐘舵€?Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鐢诲竷鎷栨嫿鐘舵€併€佹閫夋鍜屽榻愯緟鍔╃嚎鐘舵€佷粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁鐢诲竷骞崇Щ銆丼hift 妗嗛€夈€佸崟鑺傜偣鎷栧姩銆佸鑺傜偣鎷栧姩銆佸榻愯緟鍔╃嚎銆丒scape 娓呯悊鍜屾嫋鎷藉彇娑堣涓猴紝涓嶆敼 Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphDragState.ts`锛岀粺涓€绠＄悊 `dragState`銆乣selectionBox`銆乣alignmentGuides`銆乣beginMarquee`銆乣updateMarquee`銆乣beginPan`銆乣beginNodeDrag`銆乣beginMultiNodeDrag` 鍜?`clearActiveDrag`銆?- 鏂板 `useGraphDragState.test.tsx`锛岃鐩栨閫夊紑濮?鏇存柊銆佺敾甯冨钩绉汇€佸崟鑺傜偣鎷栨嫿銆佸鑺傜偣鎷栨嫿銆佽緟鍔╃嚎璁剧疆鍜屾竻鐞嗐€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦?drag/selectionBox/alignmentGuides state 鍜岀洿鎺ユ瀯閫?DragState 鐨勪唬鐮侊紱controller 浠?1719 琛岀户缁笅闄嶅埌 1689 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphDragState` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- useGraphDragState GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 閫氳繃锛? 涓枃浠躲€?7 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?4 涓敤鎴风娴嬭瘯鏂囦欢銆?07 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- pointer drag 鐨勭姸鎬佽竟鐣屽凡缁忕嫭绔嬶紝鍚庣画鍙互缁х画鎷嗙Щ鍔ㄦ椂鐨勬枃妗ｅ彉鏇淬€佸榻愬惛闄勮绠楀拰 node/edge/group mutations锛屾妸澶у瀷 controller 缁х画鍘嬬缉鍒扮紪鎺掑眰銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 12:45:34 +08:00 | v1.1.0-alpha.40 | 鎷嗗嚭鍥捐氨鑺傜偣閫夋嫨鐘舵€?Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鑺傜偣鍗曢€夈€佸閫?toggle銆佹樉寮忓閫夈€佹閫夊懡涓拰鑺傜偣閫夋嫨鏃舵竻鐞嗚竟閫夋嫨鐨勮涓轰粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁閿洏鍏ㄩ€夈€佹潵婧愭吵閬撴暣鐞嗗悗閫夋嫨銆佹閫夈€佸閫夋嫋鍔ㄣ€佸鍒惰妭鐐广€佸彸閿垹闄よ妭鐐瑰拰杈归€夋嫨娓呯悊琛屼负锛屼笉鏀?Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphSelectionState.ts`锛岀粺涓€绠＄悊 `selectedNodeId`銆乣selectedNodeIds`銆乣selectSingleNode`銆乣toggleNodeSelection`銆乣selectNodeIds`銆乣selectNodesInWorldRect`銆乣clearNodeSelection` 鍜?`resetNodeSelection`銆?- 鏂板 `useGraphSelectionState.test.tsx`锛岃鐩栧崟閫夈€乼oggle 澶氶€夈€佹竻绌恒€侀噸缃€佹樉寮忓閫夈€侀殣钘忚妭鐐硅繃婊ゅ拰妗嗛€夌煩褰㈠懡涓€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦拌妭鐐归€夋嫨 state 鍜岀洿鎺ヨ皟鐢?graph-core selection helper 鐨勪唬鐮侊紱閿洏鍏ㄩ€夈€佹潵婧愭吵閬撱€佹閫夈€佽妭鐐规嫋鍔ㄣ€佸鍒惰妭鐐瑰拰鍙抽敭鍒犻櫎鑺傜偣鏀逛负閫氳繃 `useGraphSelectionState` 鍒嗗彂锛沜ontroller 浠?1736 琛岀户缁笅闄嶅埌 1719 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphSelectionState` 鍏堢孩鍚庣豢锛屾渶缁?1 涓枃浠躲€? 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- useGraphSelectionState GraphWorkspacePage GraphWorkspaceSelectionPanel GraphWorkspaceStageChrome graphKeyboardShortcuts` 閫氳繃锛? 涓枃浠躲€?1 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?3 涓敤鎴风娴嬭瘯鏂囦欢銆?05 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- selection/marquee/multi-select 宸叉湁鐙珛鐘舵€?hook锛屽悗缁彲浠ョ户缁媶鐢诲竷 pointer drag 鐘舵€佹満鍜?node/edge/group mutations锛屾妸澶у瀷 controller 缁х画鍘嬬缉鍒扮紪鎺掑眰銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 08:25:31 +08:00 | v1.1.0-alpha.39 | 鎷嗗嚭鍥捐氨 Camera 涓庤鍙?Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸灏忓湴鍥?viewport銆佽妭鐐硅仛鐒︺€佹粴杞缉鏀俱€佸伐鍏锋爮缂╂斁銆侀噸缃閲庡拰瀵艰埅 focus preview 浠?`useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁鑱氱劍鑺傜偣銆佹悳绱㈠畾浣嶃€侀敭鐩橀噸缃閲庛€佸伐鍏锋爮缂╂斁銆佸皬鍦板浘鏄剧ず鍜屾潵婧愯烦杞惤鐐归瑙堣涓恒€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphViewportCamera.ts`锛岀粺涓€绠＄悊 `minimapViewport`銆乣focusPreview`銆乣focusNode`銆乣zoomGraph`銆乣resetViewport` 鍜?`handleWheel`銆?- 鏂板 `useGraphViewportCamera.test.tsx`锛岃鐩栧皬鍦板浘 ready 鐘舵€併€佽妭鐐硅仛鐒﹂€夋嫨涓庤鍙ｅ彉鏇淬€佹寜閽?婊氳疆缂╂斁銆侀噸缃閲庛€佸鑸?focus preview 娑堣垂鍜?2600ms 鍚庤繃鏈熴€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦?minimap 璁＄畻銆乫ocus preview effect銆乣focusNode`銆乣zoomGraph` 鍜?`handleWheel`锛屾敼鐢?`useGraphViewportCamera`锛沜ontroller 浠?1804 琛岀户缁笅闄嶅埌 1736 琛屻€?- 淇 focus preview 璁℃椂鍣ㄨ竟鐣岋細棰勮瑙﹀彂瀵艰嚧 `graphDetail` 鏇存柊鏃朵笉鍐嶆竻鎺夎繃鏈熷畾鏃跺櫒锛岄瑙堢姸鎬佷細鎸夐鏈熻嚜鍔ㄦ秷澶便€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphViewportCamera` 鍏堢孩鍚庣豢锛屾渶缁?3 涓?hook 鐢ㄤ緥閫氳繃銆?- `npm --workspace frontend-user run test -- useGraphViewportCamera GraphWorkspacePage GraphWorkspaceStageChrome graphKeyboardShortcuts` 閫氳繃锛? 涓枃浠躲€?8 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?2 涓敤鎴风娴嬭瘯鏂囦欢銆?03 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- camera/viewport 宸叉垚涓虹嫭绔?hook锛屽悗缁彲浠ョ户缁媶 selection/marquee/multi-select 鍜?node/edge/group mutations 鐘舵€佹満锛屾妸澶у瀷 controller 杩涗竴姝ュ帇鍒版洿鎺ヨ繎缂栨帓灞傘€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 08:06:34 +08:00 | v1.1.0-alpha.38 | 鎷嗗嚭鍥捐氨鍙抽敭鑿滃崟鐘舵€?Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鍙抽敭鑿滃崟鎵撳紑銆佸畾浣嶃€佽妭鐐?杈归€夋嫨鑱斿姩銆佹樉寮忓叧闂拰澶栭儴鐐瑰嚮/婊氬姩鍏抽棴浠?`useGraphWorkspaceController.tsx` 涓笅娌夈€?- 淇濈暀鐜版湁鍙抽敭鑿滃崟 UI銆佽妭鐐?杈?鐢诲竷鍙抽敭鍏ュ彛鍜岃彍鍗曞姩浣滃洖璋冿紝涓嶆敼鍙?Graph API 鎴栧浘璋辨枃浠跺悎绾︺€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphContextMenu.ts`锛岀粺涓€绠＄悊 context menu 鐘舵€併€乣openContextMenu`銆乣closeContextMenu` 鍜?dismiss 鐢熷懡鍛ㄦ湡銆?- 鏂板 `useGraphContextMenu.test.tsx`锛岃鐩栬妭鐐?杈?鐢诲竷鍙抽敭鑿滃崟鍧愭爣銆佽妭鐐?杈归€夋嫨鍥炶皟銆佹樉寮忓叧闂€佸閮ㄧ偣鍑诲叧闂拰婊氬姩鍏抽棴銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦?`contextMenu` state銆佹棫 `openContextMenu` 鍑芥暟鍜屽唴鑱?dismiss effect锛屾敼鐢?`useGraphContextMenu`锛沜ontroller 浠?1822 琛岀户缁笅闄嶅埌 1804 琛屻€?- 娓呯悊 `useGraphWorkspaceEffects.ts` 涓笉鍐嶄娇鐢ㄧ殑 `useGraphContextMenuDismiss`銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphContextMenu` 鍏堢孩鍚庣豢锛屾渶缁?2 涓?hook 鐢ㄤ緥閫氳繃銆?- `npm --workspace frontend-user run test -- useGraphContextMenu GraphWorkspacePage GraphWorkspacePanels GraphWorkspaceStageChrome` 閫氳繃锛? 涓枃浠躲€?7 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?1 涓敤鎴风娴嬭瘯鏂囦欢銆?00 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鍙抽敭鑿滃崟杈撳叆鐢熷懡鍛ㄦ湡宸叉垚涓虹嫭绔?hook锛屽悗缁彲浠ョ户缁妸鑿滃崟鍔ㄤ綔鍒嗗彂銆乻election/marquee/multi-select 鍜?camera/viewport 鐘舵€佹満浠庡ぇ鍨?controller 涓Щ鍑恒€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 07:56:20 +08:00 | v1.1.0-alpha.37 | 鎷嗗嚭鍥捐氨閿洏蹇嵎閿?Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鍏ㄥ眬 `keydown` 鐩戝惉銆佸揩鎹烽敭涓婁笅鏂囧垽鏂拰 action 鍒嗗彂浠?`useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁淇濆瓨銆乁ndo/Redo銆佸叏閫夈€佸垹闄ゃ€佽仛鐒︺€佸垎缁勩€侀摼璺ā寮忋€侀噸缃閲庛€侀敭鐩樺府鍔╁拰 Escape 娓呯悊琛屼负銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphKeyboardActions.ts`锛岀粺涓€鎵挎帴 `resolveGraphKeyboardShortcut` 鐨?action 鍒嗗彂鍜?keydown 鐢熷懡鍛ㄦ湡銆?- 鏂板 `useGraphKeyboardActions.test.tsx`锛岃鐩栬緭鍏ユ鍐呬粛鍙繚瀛?鎾ら攢/閲嶅仛銆佽緭鍏ユ鍐呭拷鐣ョ敾甯冪紪杈戝揩鎹烽敭銆侀€夋嫨/鑱氱劍/鍒嗙粍/閾捐矾/閲嶇疆/Escape 绛夊父鐢ㄦ搷浣溿€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゅ唴鑱?keydown effect锛屾敼涓哄悜 `useGraphKeyboardActions` 浼犻€掑綋鍓嶉€夋嫨鎬併€佸彲瑙佽妭鐐瑰拰鍔ㄤ綔鍥炶皟锛沜ontroller 浠?1857 琛岀户缁笅闄嶅埌 1822 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphKeyboardActions` 鍏堢孩鍚庣豢锛屾渶缁?3 涓?hook 鐢ㄤ緥閫氳繃銆?- `npm --workspace frontend-user run test -- useGraphKeyboardActions graphKeyboardShortcuts GraphWorkspacePage GraphWorkspaceShell GraphWorkspacePanels` 閫氳繃锛? 涓枃浠躲€?0 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?0 涓敤鎴风娴嬭瘯鏂囦欢銆?8 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 蹇嵎閿涓哄凡缁忔垚涓虹嫭绔?hook锛屽悗缁彲浠ョ户缁媶 context menu 鍜?selection/marquee 鐘舵€佹満锛岄€愭鎶婃垚鐔熺紪杈戝櫒鐨勮緭鍏ヤ笌閫夋嫨鎿嶄綔浠?controller 涓Щ鍑恒€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 07:41:41 +08:00 | v1.1.0-alpha.36 | 鎷嗗嚭鍥捐氨瀵煎叆瀵煎嚭鎵ц Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鍜?Phase 5 鎷嗗垎锛屾妸 Markdown/Mermaid 杩滅瀵煎叆銆丼tudyMate JSON 鏈湴瀵煎叆銆丳NG/SVG/JSON 瀵煎嚭鍜屽鍑哄け璐ョ姸鎬佷粠 `useGraphWorkspaceController.tsx` 涓嬫矇銆?- 淇濈暀鐜版湁 Graph API銆乣.smtg` / `application/vnd.studymate.graph+json` 鏂囦欢鍚堢害銆丣SON 瀵煎叆鏍￠獙鍜?Markdown/Mermaid 瀵煎叆鍚庡揩鐓у埛鏂拌涓恒€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphImportExport.ts`锛岀粺涓€绠＄悊 JSON/Markdown/Mermaid 瀵煎叆銆丳NG/SVG/JSON 瀵煎嚭銆佸畨鍏ㄦ枃浠跺悕鍜屽鍏ュ鍑虹姸鎬佹彁绀恒€?- 鏂板 `useGraphImportExport.test.tsx`锛岃鐩?JSON 瀵煎叆鎴愬姛銆丣SON 闃绘柇閿欒銆丮arkdown 杩滅瀵煎叆骞跺埛鏂板揩鐓с€丳NG/SVG/JSON 瀹夊叏鏂囦欢鍚嶅鍑猴紝浠ュ強绌哄唴瀹?涓嬭浇/PNG 娓叉煋澶辫触鐘舵€併€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦板鍏ュ鍑哄嚱鏁颁綋锛屾敼涓鸿浆鍙?`useGraphImportExport` 鎿嶄綔锛沜ontroller 浠?1938 琛岀户缁笅闄嶅埌 1857 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphImportExport` 鍏堢孩鍚庣豢锛屾渶缁?5 涓?hook 鐢ㄤ緥閫氳繃銆?- `npm --workspace frontend-user run test -- useGraphImportExport GraphWorkspacePage GraphWorkspaceImportPanel graphFileImportExport graphCanvasExport` 閫氳繃锛? 涓枃浠躲€?3 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?9 涓敤鎴风娴嬭瘯鏂囦欢銆?5 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 瀵煎叆瀵煎嚭鎵ц閫昏緫宸茬粡褰㈡垚鐙珛杈圭晫锛屽悗缁彲浠ョ户缁媶 keyboard/context menu/selection 鐘舵€佹満锛屽苟鎶婃枃浠舵垚鐔熷害娴嬭瘯鎵╁睍鍒版洿澶у浘瀵煎嚭鑰楁椂涓庡け璐ュ満鏅€?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 07:25:40 +08:00 | v1.1.0-alpha.35 | 鎷嗗嚭鍥捐氨淇濆瓨涓庡揩鐓ф寔涔呭寲 Hook
### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸淇濆瓨銆佷繚瀛樼姸鎬併€佽嚜鍔ㄤ繚瀛樼敓鍛藉懆鏈熴€佺椤典繚鎶ゃ€佸揩鐓у垪琛ㄥ姞杞藉拰蹇収鎭㈠浠?`useGraphWorkspaceController.tsx` 涓媶鍒扮嫭绔?hook銆?- 淇濈暀鐜版湁 Graph API銆乣.smtg` 鏂囦欢鏍煎紡銆佷繚瀛?鎭㈠ UI 鍜岀姸鎬佹彁绀鸿涓猴紝涓嶆敼鍙樺鍏ャ€佸垏鍥俱€佸垱寤哄浘璋辩瓑璋冪敤鏂瑰绾︺€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/hooks/useGraphWorkspacePersistence.ts`锛岀粺涓€绠＄悊 `idle/dirty/pending/saved/failed` 淇濆瓨鎬佷腑鐨?`pending/saved/failed` 杞崲銆乣saving`銆佸揩鐓у垪琛ㄣ€佹墜鍔?鑷姩淇濆瓨鍜屽揩鐓ф仮澶嶃€?- 鏂板 `useGraphWorkspacePersistence.test.tsx`锛岃鐩栦繚瀛樺悗鏍囪 history saved 骞跺埛鏂板揩鐓с€佸揩鐓ф仮澶嶈蛋缁熶竴 reset history 璺緞銆佸揩鐓у垪琛?鎭㈠ API 澶辫触鏃朵繚鐣欏彲缂栬緫鐘舵€佸苟鏄剧ず澶辫触銆?- 鏇存柊 `useGraphWorkspaceController.tsx`锛岀Щ闄ゆ湰鍦颁繚瀛?蹇収鐘舵€佸拰 `saveCurrentGraph` / `handleRestoreSnapshot` 瀹炵幇锛屾敼鐢?`useGraphWorkspacePersistence` 杩斿洖鐨勬搷浣滐紱controller 浠?2012 琛岀户缁笅闄嶅埌 1938 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- useGraphWorkspacePersistence` 鍏堢孩鍚庣豢锛屾渶缁?3 涓?hook 鐢ㄤ緥閫氳繃銆?- `npm --workspace frontend-user run test -- useGraphWorkspacePersistence GraphWorkspacePage GraphWorkspaceRecoveryPanel GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€?4 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?8 涓敤鎴风娴嬭瘯鏂囦欢銆?0 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 淇濆瓨銆佽嚜鍔ㄤ繚瀛樸€佺椤典繚鎶ゅ拰蹇収鎭㈠宸茬粡浠庡ぇ鍨?controller 涓舰鎴愮嫭绔嬭竟鐣岋紝鍚庣画鍙互缁х画鎶婂鍏ユ墽琛屽垎鏀笅娌変负 `useGraphImportExport`锛屽苟杩涗竴姝ユ媶鍒?keyboard/context menu/selection 鐘舵€佹満銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 00:42:51 +08:00 | v1.1.0-alpha.34 | 鎷嗗嚭鍥捐氨瀵煎叆涓庢牎楠岄潰鏉?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屾妸鍙充晶 rail 涓殑 Markdown/Mermaid/JSON 瀵煎叆銆佸鍏ユ枃鏈尯銆佸鍏ユ寜閽€佹牎楠屾寜閽拰楠岃瘉缁撴灉鍒楄〃浠?`useGraphWorkspaceController.tsx` 涓媶鍑恒€?- 淇濈暀鐜版湁瀵煎叆妯″紡銆佸鍏ユ簮鏂囨湰銆佷繚瀛樹腑绂佺敤銆佹牎楠屽浘璋卞拰楠岃瘉闈㈡澘灞曠ず琛屼负锛屼笉鏀瑰彉 Graph API 鎴?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceImportPanel.tsx`锛屾壙鎺ュ鍏ユ牸寮?segmented control銆佸彲璁块棶 textarea銆佸鍏?鏍￠獙鎿嶄綔鍜?`GraphValidationIssueList`銆?- 鏂板 `GraphWorkspaceImportPanel.test.tsx`锛岃鐩栧鍏ユā寮忓垏鎹€佸鍏ュ唴瀹瑰彉鏇淬€佸鍏?鏍￠獙鍥炶皟銆佷繚瀛樹腑绂佺敤鍜岄獙璇侀棶棰樺睍绀恒€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛屾妸瀵煎叆涓庢牎楠?JSX 鏇挎崲涓?`GraphWorkspaceImportPanel` 璋冪敤锛宑ontroller 缁х画涓嬮檷鍒?2012 琛屻€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- GraphWorkspaceImportPanel` 鍏堢孩鍚庣豢锛屾渶缁?3 涓粍浠剁敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceImportPanel GraphWorkspacePage GraphWorkspacePanels` 閫氳繃锛? 涓枃浠躲€?4 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛寃orkspace typecheck 鍜屾枃妗ｆ牎楠屽潎閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?7 涓敤鎴风娴嬭瘯鏂囦欢銆?7 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 瀵煎叆涓庢牎楠?UI 宸叉垚涓虹嫭绔嬬粍浠讹紝鍚庣画鍙互缁х画鎶?`handleImport` / JSON-Mermaid-Markdown 鍒嗘敮涓嬫矇鍒?`useGraphImportExport`锛岃繘涓€姝ュ噺灏?controller 涓殑鍓綔鐢ㄩ€昏緫銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鎷嗗垎銆?
## 2026-06-06 00:34:54 +08:00 | v1.1.0-alpha.33 | 鎷嗗嚭鍥捐氨鑺傜偣涓庤繛绾胯鎯呴潰鏉?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屼紭鍏堟妸鍙充晶 rail 涓殑鈥滈€変腑鍐呭 / 鑺傜偣涓庤繛绾库€濊鎯呯紪杈戝尯浠?`useGraphWorkspaceController.tsx` 涓笅娌変负绾鍥剧粍浠躲€?- 淇濈暀鐜版湁鑺傜偣鏍囬銆佺瑪璁般€乁RL/鍥剧墖/鍏紡/PDF metadata銆侀鑹层€佸己璋冦€佸昂瀵搞€佽竟鏍囩銆佽竟褰㈡€併€佸垎缁勬爣棰樸€佸垎缁勬姌鍙犮€佸閫夋暣鐞嗗拰鏉ユ簮鍙嶉摼琛屼负銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceSelectionPanel.tsx`锛屾壙鎺ュ崟鑺傜偣璇︽儏銆佸閫夋壒閲忔搷浣溿€佽竟璇︽儏缂栬緫銆佸垎缁勫垪琛ㄥ拰绌烘€佹搷浣滄彁绀恒€?- 鏂板 `GraphWorkspaceSelectionPanel.test.tsx`锛岃鐩栬妭鐐规爣棰?URL metadata 缂栬緫銆佹潵婧愬弽閾惧洖璋冦€佽竟鏍囩/鐩寸嚎鏇茬嚎鍥炶皟銆佸閫夋潵婧愭暣鐞嗐€佸垎缁勬爣棰樼紪杈戝拰绌烘€佹彁绀恒€?- 鏇存柊 `useGraphWorkspaceController.tsx`锛屾妸璇︽儏 rail JSX 鏇挎崲涓?`GraphWorkspaceSelectionPanel` 璋冪敤锛宑ontroller 鍙繚鐣欎笉鍙彉 document mutation銆乭istory 鍜屼繚瀛樼姸鎬佸洖璋冦€?- 娓呯悊 controller 涓殢璇︽儏闈㈡澘鎷嗗嚭鍚庝笉鍐嶉渶瑕佺殑鍥炬爣銆佽妭鐐规牱寮忓拰 metadata 灞曠ず imports銆?- 鏂囦欢瑙勬ā缁х画涓嬮檷锛歚useGraphWorkspaceController.tsx` 浠?2321 琛岄檷鍒?2049 琛岋紝鏂板璇︽儏缁勪欢 497 琛岋紝绗﹀悎鏅€氫笟鍔＄粍浠?500 琛屽唴鐨勯樁娈电洰鏍囥€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel` 鍏堢孩鍚庣豢锛屾渶缁?4 涓粍浠剁敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceSelectionPanel GraphWorkspacePage GraphWorkspaceRecoveryPanel GraphWorkspaceSourceSummary` 閫氳繃锛? 涓枃浠躲€?6 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run lint` 閫氳繃锛屽寘鍚叏宸ヤ綔鍖?typecheck 鍜屾枃妗ｅ悓姝ラ獙璇併€?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?6 涓敤鎴风娴嬭瘯鏂囦欢銆?4 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鑺傜偣/杩炵嚎璇︽儏缂栬緫宸茬粡鏈夌嫭绔嬬粍浠跺拰娴嬭瘯淇濇姢锛屽悗缁彲浠ョ户缁妸 controller 鍐呯殑鐢诲竷 pointer drag銆乵arquee銆佸閫夌姸鎬佹満鍜屽鍏ュ鍑?hook 鎷嗗嚭銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鐨勫眬閮ㄦ紨杩涖€?
## 2026-06-06 00:17:47 +08:00 | v1.1.0-alpha.32 | 鎷嗗垎鍥捐氨鏍稿績妯″潡骞惰ˉ缂栬緫鍣ㄦ垚鐔熷害鍥炲綊
### 浠诲姟鍐呭
- 缁х画鎵ц StudyMate 鍥捐氨宸ヤ綔鍖?Project Graph 瀵规爣璁″垝锛屼紭鍏堝鐞?`@studymate/graph-core` 鍗曟枃浠惰繃澶х殑缁撴瀯椋庨櫓锛屽苟琛ュ墠绔妭鐐?杩炵嚎缂栬緫銆佸悗绔姹傝竟鐣屽拰 E2E 澶辫触鐘舵€佽鐩栥€?- 淇濇寔鐜版湁 Graph API銆乣.smtg` schemaVersion 1 鍜屽墠绔?`GraphWorkspacePage` 鍏ュ彛鍏煎锛屼笉寮曞叆 WebGL/Pixi銆丆RDT銆乀auri 鎴?`.prg` 鍏煎銆?### 瀹屾垚缁撴灉
- 鏂板 `packages/graph-core/src/model.ts`銆乣source.ts`銆乣mutations.ts`銆乣validation.ts`銆乣file-format.ts`銆乣history.ts`銆乣templates.ts`銆乣fixtures.ts`銆乣selection.ts`銆乣viewport.ts` 鍜?`utils.ts`锛屾妸鍘?`index.ts` 鎷嗘垚鑱氱劍妯″潡骞朵繚鐣?barrel 瀵煎嚭銆?- 鏂板 `packages/graph-core/test/graphCoreModules.test.ts`锛岄攣瀹氭ā鍧楀寲鍏ュ彛浠嶈兘鏆撮湶鏂囨。瑙勮寖鍖栥€侀獙璇併€乣.smtg` 瀵煎叆瀵煎嚭銆乭istory銆佹ā鏉裤€乫ixture銆乻election 鍜?viewport 鑳藉姏銆?- 鏇存柊鐢ㄦ埛绔浘璋遍〉闈㈡祴璇曪紝瑕嗙洊閫変腑 URL 鑺傜偣鍚庣紪杈戞爣棰樺拰绫诲瀷 metadata銆侀€変腑杈瑰悗缂栬緫鍏崇郴鏍囩鍜岀洿绾?鏇茬嚎褰㈡€侊紝骞堕獙璇佷繚瀛?payload銆?- 鎵╁睍 `e2e/v1-graph-workspace.spec.ts`锛屽湪 200 鑺傜偣銆?00 杈广€?0 鍒嗙粍 smoke 涓ˉ蹇嵎閿潰鏉裤€丣SON 瀵煎叆澶辫触銆佸揩鐓ф仮澶嶅け璐ュ拰鏉ユ簮鍙嶉摼璺宠浆銆?- 鏇存柊鍚庣 graph handler锛屾棤鏁?JSON/binding 璇锋眰缁熶竴杩斿洖 400 `invalid_graph_request`锛岄伩鍏嶅浘璋变繚瀛樸€佹仮澶嶃€佸鍏ュ拰 AI 鑽夌鍏ュ彛鎶婂鎴风閿欒璇姤涓?500銆?- 鏇存柊鍚庣鍥捐氨鏍￠獙 helper锛宍metadata.targetNodeIds` 鍚屾椂鍏煎 JSON 瑙ｇ爜寰楀埌鐨?`[]any` 鍜屾湇鍔″唴閮ㄦ瀯閫犵殑 `[]string`锛岄伩鍏嶅鐩爣杈规紡妫€鎮寕鐩爣銆?- 鏇存柊 `frontend-user/tsconfig.json`锛屽厑璁稿墠绔?noEmit typecheck 娑堣垂 graph-core 鍐呴儴 `.ts` 妯″潡 import銆?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?7 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspacePage` 閫氳繃锛? 涓〉闈㈢骇鍥捐氨鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `cd backend && go test ./internal/modules/graph/...` 閫氳繃銆?- `npm run lint` 閫氳繃锛屽寘鍚叏宸ヤ綔鍖?typecheck 鍜屾枃妗ｅ悓姝ラ獙璇併€?- `npm run build:user` 閫氳繃銆?- `npm run test:user` 閫氳繃锛?5 涓敤鎴风娴嬭瘯鏂囦欢銆?0 涓敤渚嬪叏閮ㄩ€氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚墿灞曞悗鐨?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- `graph-core` 鏈€澶у疄鐜版枃浠跺凡闄嶅埌绾?220 琛岋紝鍚庣画鍙互鎸夋ā鍧楃户缁ˉ鏂囦欢鏍煎紡銆侀獙璇佸拰鎬ц兘 fixture 娴嬭瘯锛岃€屼笉鍐嶆妸閫昏緫鍘嬪洖鍗曚竴鍏ュ彛銆?- 鍥捐氨鍓嶇鐨勮妭鐐?杩炵嚎璇︽儏缂栬緫宸叉湁椤甸潰绾у洖褰掍繚鎶わ紝涓嬩竴姝ラ€傚悎缁х画鎶婅鎯?rail 浠?controller 涓媶鎴愬鍣ㄥ拰绾鍥剧粍浠躲€?- 鍚庣鍥捐氨璇锋眰杈圭晫鏇寸ǔ瀹氾紝鍚庣画琛?service 绾ф寔涔呭寲娴嬭瘯鏃朵粛寤鸿鍏堟娊 repository/document interface锛岄伩鍏嶅崟鍏冩祴璇曚緷璧栫湡瀹?MySQL/Mongo銆?
## 2026-06-05 20:37:23 +08:00 | v1.1.0-alpha.31 | 鎷嗗嚭鍥捐氨鍙充晶鏉ユ簮涓庢仮澶嶉潰鏉?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘鍥捐氨宸ヤ綔鍖?Phase 1 鎷嗗垎锛屼紭鍏堟妸鍙充晶 rail 涓拰瀛︿範闂幆/鎭㈠閾捐矾鐩稿叧鐨勭函灞曠ず鍖轰粠 `useGraphWorkspaceController.tsx` 涓嬁鍑烘潵銆?- 淇濈暀褰撳墠鏉ユ簮鍙嶉摼銆佹潵婧愭憳瑕併€佸崱鐗囪崏绋跨紪杈戙€佸啓鍏ュ崱缁勫拰蹇収鎭㈠琛屼负锛屼笉鏀瑰彉鐜版湁 Graph API 涓?`.smtg` 鏂囦欢鍚堢害銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceSourceSummary.tsx`锛屾壙鎺ユ潵婧愮被鍨嬬粺璁°€佸绔?鏃犳潵婧愯妭鐐规彁绀恒€佸墠 5 涓潵婧愬垪琛ㄣ€佹潵婧愬弽閾炬寜閽拰绌烘€併€?- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceRecoveryPanel.tsx`锛屾壙鎺ョ敓鎴愬崱鐗囪崏绋挎寜閽€乨eck 閫夋嫨銆佽崏绋块棶棰?绛旀缂栬緫銆佺‘璁ゅ啓鍏ュ崱缁勫拰蹇収鎭㈠鍒楄〃銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸鏉ユ簮鎽樿涓庡揩鐓?鍗＄墖鑽夌 UI 鏇挎崲涓虹粍浠惰皟鐢紝controller 浠?2609 琛岀户缁檷鍒?2487 琛屻€?- 鏂板 `GraphWorkspaceSourceSummary.test.tsx` 涓?`GraphWorkspaceRecoveryPanel.test.tsx`锛岃鐩栨潵婧愮粺璁°€佸弽閾捐烦杞洖璋冦€佺┖鎬併€佹潵婧愭姌鍙犳彁绀恒€佸崱鐗囪崏绋跨紪杈戙€佺‘璁ゅ啓鍏ュ拰蹇収鎭㈠鍥炶皟銆?- 鏇存柊 `docs/planning/VERSION_PLAN.md` 涓?`docs/planning/versions/v0.6.0-graph-product.md`锛屽悓姝ヨ褰曞彸渚?rail 鐨勬潵婧愭憳瑕併€佸揩鐓ф仮澶嶅拰鍗＄墖鑽夌闈㈡澘宸叉媶鍑恒€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceRecoveryPanel GraphWorkspaceSourceSummary GraphWorkspaceStageChrome GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€?1 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛屽寘鍚叏宸ヤ綔鍖?typecheck 鍜屾枃妗ｅ悓姝ラ獙璇併€?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?6 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?5 涓枃浠躲€?8 涓敤鎴风鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鍥捐氨鏉ユ簮鎽樿鍜屾仮澶?鍗＄墖鑽夌閾捐矾鐜板湪鏈夌嫭绔嬬粍浠舵祴璇曚繚鎶わ紝鍚庣画鍙互缁х画鎷嗚妭鐐?杩炵嚎璇︽儏缂栬緫鍖猴紝鑰屼笉闇€瑕佸悓鏃惰Е纰版潵婧愪笌鎭㈠ UI銆?- 褰撳墠浠嶄笉杩涘叆澶氫汉鍗忎綔銆乄ebGL/Pixi銆乀auri 鎴?`.prg` 鍏煎锛岀户缁部鐜版湁 Web 鍥捐氨鏋舵瀯鍋氬彲楠岃瘉鐨勫眬閮ㄤ骇鍝佸寲銆?
## 2026-06-05 20:24:42 +08:00 | v1.1.0-alpha.30 | 鎷嗗嚭鍥捐氨鐢诲竷 Stage 绾鍥剧粍浠?### 浠诲姟鍐呭
- 缁х画鎺ㄨ繘 StudyMate 鍥捐氨宸ヤ綔鍖?Project Graph 瀵规爣璁″垝锛屼紭鍏堟媶鍒?`useGraphWorkspaceController.tsx` 鐨勭敾甯?JSX锛岄伩鍏嶇户缁妸 stage status銆亀orld銆乵inimap 鍜岀┖鎬佹覆鏌撳爢鍦ㄥぇ鍨?controller 涓€?- 淇濈暀鐜版湁鑺傜偣銆佽竟銆佸垎缁勩€佹閫夈€佸皬鍦板浘銆佸彸閿彍鍗曘€侀敭鐩樻寚鍗楀拰閫夋嫨鎬佽涓猴紝鍙妸瑙嗗浘琛ㄩ潰涓嬫矇鍒板彲娴嬭瘯缁勪欢銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.tsx`锛屾媶鍑?`GraphStageStatus`銆乣GraphStageCanvas`銆乣GraphStageMinimap` 鍜?`GraphStageEmptyState`銆?- `GraphStageCanvas` 鍙帴鏀舵枃妗ｃ€侀€変腑鎬併€佺敾甯冩祴閲忓紩鐢ㄥ拰浜嬩欢鍥炶皟锛涜妭鐐?杈?鍒嗙粍 mutation銆佸巻鍙层€佷繚瀛樺拰瀵煎叆瀵煎嚭浠嶇暀鍦?controller锛岄伩鍏嶆媶鍒嗘椂鏀瑰彉涓氬姟鐘舵€佹満銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸 stage status/world/minimap/empty state 娓叉煋鏇挎崲涓虹函瑙嗗浘缁勪欢璋冪敤锛宑ontroller 浠?2785 琛岄檷鍒?2609 琛屻€?- 鏂板 `frontend-user/src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`锛岃鐩栫姸鎬佹潯 aria-live銆佸榻愭彁绀恒€佸皬鍦板浘閫変腑鎬併€佺┖鎬佹彁绀猴紝浠ュ強鑺傜偣鐐瑰嚮銆佽竟閫夋嫨鍜屽垎缁勬姌鍙犲洖璋冨鎵樸€?- 鏇存柊 `docs/planning/VERSION_PLAN.md` 涓?`docs/planning/versions/v0.6.0-graph-product.md`锛屽悓姝ヨ褰?stage 绾鍥剧粍浠跺凡鎷嗗嚭锛屽彸渚ц鎯?rail 鍜岀敾甯冧氦浜掔姸鎬佹満浠嶆槸鍚庣画鎷嗗垎閲嶇偣銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceStageChrome GraphWorkspaceShell` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run lint` 閫氳繃锛屽寘鍚叏宸ヤ綔鍖?typecheck 鍜屾枃妗ｅ悓姝ラ獙璇併€?- `npm run build:user` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?6 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:user` 閫氳繃锛?3 涓枃浠躲€?3 涓敤鎴风鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `cd backend && go test ./...` 閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨 smoke銆?### 鍚庣画褰卞搷
- 鐢诲竷娓叉煋琛ㄩ潰鐜板湪鍏峰鐙珛缁勪欢娴嬭瘯淇濇姢锛屽悗缁彲浠ョ户缁妸 pointer drag銆乵arquee銆佸閫夈€乧ontext menu 鍜?detail rail 鍒嗗埆鎷嗘垚鏇村皬 hook/component銆?- 褰撳墠娌℃湁寮曞叆 WebGL/Pixi銆丆RDT銆乀auri 鎴?`.prg` 鍏煎锛屼粛娌跨幇鏈?Web 鍥捐氨鏋舵瀯鍋氬眬閮ㄦ紨杩涖€?
## 2026-06-05 10:28:51 +08:00 | v1.1.0-alpha.29 | 琛ラ綈鍥捐氨宸ュ叿鏍忔墿灞曡妭鐐圭被鍨嬪叆鍙?### 浠诲姟鍐呭
- 瀵归綈 Project Graph 绾ц妭鐐圭紪杈戜綋楠岃姹傦紝鎶婃蹇点€佺瑪璁般€佽祫鏂欍€佸崱鐗囥€丄I銆佸浘鐗囥€乁RL銆佸叕寮忋€丳DF 閿氱偣涔濈被 StudyMate 鑺傜偣浠庢暎钀藉湪 controller 閲岀殑榛樿鍊兼敹鏁涗负缁熶竴閰嶇疆銆?- 閬垮厤缁х画澧炲姞涓荤晫闈㈡寜閽爢锛屾敼鐢ㄢ€滆妭鐐圭被鍨嬩笅鎷?+ 鏂板缓鎸夐挳鈥濈殑绱у噾鍏ュ彛鏆撮湶鎵╁睍鑺傜偣绫诲瀷銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphNodeTypes.test.ts`锛屽厛浠ョ己澶?helper 褰㈡垚 RED锛屽啀瑕嗙洊涔濈被鑺傜偣閫夐」銆侀粯璁ゆ爣棰?灏哄鍜屾潵婧?label 缁ф壙銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphNodeTypes.ts`锛屽鍑鸿妭鐐圭被鍨?union銆侀厤缃垪琛ㄣ€佺被鍨嬫煡璇㈠拰 `buildGraphNodeDraft`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾柊寤鸿妭鐐规祦绋嬪鐢ㄨ妭鐐圭被鍨嬮厤缃紝宸ュ叿鏍忔柊澧炲彲璁块棶鐨勨€滈€夋嫨鏂板缓鑺傜偣绫诲瀷鈥濅笅鎷夊拰鍔ㄦ€佲€滄柊寤篨鑺傜偣鈥濇寜閽€?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃鐩栦粠宸ュ叿鏍忛€夋嫨 URL 绫诲瀷骞跺垱寤?URL 鑺傜偣鍚庤繘鍏?dirty 淇濆瓨鐘舵€併€?- 鏇存柊 `frontend-user/src/styles/graph.css`锛屼负鑺傜偣绫诲瀷涓嬫媺琛ュ厖绱у噾鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphNodeTypes.test.ts` 鍏堢孩鍚庣豢锛屾渶缁?3 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?### 鍚庣画褰卞搷
- 鐢ㄦ埛鐜板湪鍙互浠庝富宸ュ叿鏍忓垱寤哄叏閮?StudyMate 浜у搧鍖栬妭鐐圭被鍨嬶紱鍚庣画鍙户缁ˉ鑺傜偣璇︽儏闈㈡澘涓?URL/鍏紡/PDF 閿氱偣鐨勪笓灞炲瓧娈电紪杈戝拰閿洏鑿滃崟鍏ュ彛銆?- 鑺傜偣绫诲瀷閰嶇疆宸茶劚绂诲ぇ鍨?controller锛屽悗缁鍏ャ€丄I 鑽夌鍜屾ā鏉夸篃鍙鐢ㄥ悓涓€濂楅粯璁ゅ€笺€?
## 2026-06-05 10:23:12 +08:00 | v1.1.0-alpha.28 | 涓嬫矇鍥捐氨 PNG 瀵煎嚭娓叉煋杈圭晫
### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸 PNG 瀵煎嚭涓殑 SVG Blob銆両mage 鍔犺浇銆乧anvas 缁樺埗鍜?object URL 鐢熷懡鍛ㄦ湡浠?controller 涓笅娌変负鍙祴璇?helper銆?- 淇濈暀鐜版湁 PNG/SVG/JSON 瀵煎嚭鍏ュ彛鍜岀敤鎴峰彲瑙佹枃妗堬紝閲嶇偣闄嶄綆瀵煎嚭澶辫触鏃惰祫婧愰噴鏀句笌娴忚鍣?API 缁嗚妭鐨勫洖褰掗闄┿€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphCanvasExport.test.ts`锛屽厛浠ョ己澶?helper 褰㈡垚 RED锛屽啀瑕嗙洊 SVG 娓叉煋鎴?PNG blob銆乧anvas 灏哄銆佽儗鏅～鍏呫€佸浘鐗囩粯鍒跺拰澶辫触鏃跺洖鏀?object URL銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphCanvasExport.ts`锛屽鍑?`renderGraphPngBlobFromSvg`锛屽苟鍦?`finally` 涓粺涓€鍥炴敹 object URL銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛孭NG 瀵煎嚭鎸夐挳澶嶇敤鏂?helper锛宑ontroller 涓嶅啀鐩存帴绠＄悊 Image/canvas/toBlob 缁嗚妭銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphCanvasExport.test.ts` 鍏堢孩鍚庣豢锛屾渶缁?2 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/GraphWorkspacePage.test.tsx` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- PNG 瀵煎嚭鑳藉姏鍏峰娴忚鍣ㄨ祫婧愮敓鍛藉懆鏈熷崟鍏冩祴璇曚繚鎶わ紱涓嬩竴姝ラ€傚悎缁х画鎶?SVG/JSON 涓嬭浇鍖呰銆丮arkdown/Mermaid/JSON 瀵煎叆鐘舵€佸拰淇濆瓨鎭㈠娴佺▼鎷嗘垚鏇村皬 hook銆?- 澶ц妯?Pixi/WebGL 杩佺Щ浠嶄笉杩涘叆褰撳墠闃舵锛岀户缁寜 DOM/SVG 灞€閮ㄤ紭鍖栬矾绾挎帹杩涖€?
## 2026-06-05 10:19:20 +08:00 | v1.1.0-alpha.27 | 鎶藉嚭鍥捐氨宸ヤ綔鍖哄姞杞界姸鎬佽竟鐣屽苟瀹屾垚鍏ㄩ摼楠岃瘉
### 浠诲姟鍐呭
- 寤剁画鍥捐氨宸ヤ綔鍖?controller 鎷嗗垎锛屾妸鏁版嵁鍔犺浇銆佸垵濮嬪浘璋遍€夋嫨銆佽鎯呰鑼冨寲鍜屽揩鐓уけ璐?ready 鏂囨浠庡ぇ鍨?hook 涓笅娌変负鍙祴璇?helper銆?- 鍦ㄧ户缁媶鍒嗗墠琛ヨ窇鍥捐氨浜у搧鍖栨渶缁堥獙璇侀摼锛岀‘璁や笂涓€闃舵绱鑳藉姏鍦ㄥ綋鍓嶄粨搴撶湡瀹炵姸鎬佷笅浠嶅彲鏋勫缓銆佹祴璇曞拰 E2E 鎵撳紑銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphWorkspaceLoadState.test.ts`锛屽厛浠ョ己澶?helper 褰㈡垚 RED锛屽啀瑕嗙洊璇锋眰鍥捐氨浼樺厛绾с€佽崏绋跨墝缁勯粯璁ゅ€笺€佺己澶?document 瑙勮寖鍖栧拰蹇収澶辫触鏂囨淇濈暀銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphWorkspaceLoadState.ts`锛屽鍑?`buildGraphWorkspaceResourceState`銆乣normalizeGraphWorkspaceDetail` 鍜?`buildGraphWorkspaceLoadedStatus`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽姞杞姐€佸垱寤洪寮犲浘璋卞拰鍒囨崲鍥捐氨璺緞澶嶇敤鏂?helper锛涗繚鐣欎繚瀛樸€佸鍏ャ€佹仮澶嶇瓑鏃㈡湁閫昏緫涓嶆墿鏁ｆ湰娆℃敼鍔ㄨ寖鍥淬€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?6 涓?graph-core 鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `cd backend; go test ./...` 閫氳繃銆?- `npm run lint` 閫氳繃锛屽寘鍚叏宸ヤ綔鍖?typecheck 鍜屾枃妗ｅ悓姝ラ獙璇併€?- `npm run build:user` 閫氳繃銆?- `npm run test:user` 閫氳繃锛?7 涓枃浠躲€?1 涓敤鎴风鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm run test:e2e` 閫氳繃锛? 涓?Playwright 鐢ㄤ緥鍏ㄩ儴閫氳繃锛屽寘鍚?200 鑺傜偣鍥捐氨鎵撳紑涓?JSON 瀵煎嚭 smoke銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphWorkspaceLoadState.test.ts` 鍏堢孩鍚庣豢锛屾渶缁?4 涓敤渚嬮€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts` 閫氳繃锛? 涓枃浠躲€? 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鍔犺浇鐘舵€佽竟鐣屽凡缁忎粠 controller 涓户缁笅娌夛紱`useGraphWorkspaceController.tsx` 浠嶇害 114KB / 2971 琛岋紝涓嬩竴姝ラ€傚悎缁х画鎷嗘暟鎹繚瀛?瀵煎叆瀵煎嚭 hook 鎴栫敾甯?pointer drag 鐘舵€併€?- `.prg` 鍏煎銆佸鐩爣杈?UI銆佸鏉傝嚜鍔ㄥ竷灞€銆佸浜哄崗浣溿€乀auri 鍜?WebGL/Pixi 閲嶅啓浠嶆寜璁″垝寤跺悗銆?
## 2026-06-05 10:09:20 +08:00 | v1.1.0-alpha.26 | 琛ュ浘璋卞伐浣滃尯淇濆瓨銆佸揩鐓т笌 JSON 瀵煎叆澶辫触椤甸潰鍥炲綊
### 浠诲姟鍐呭
- 寤剁画 autosave/dirty/snapshot 浜у搧鍖栧垏鐗囷紝鎶婁笂涓€杞函閫昏緫鐘舵€?helper 鎺ㄨ繘鍒扮湡瀹炲伐浣滃尯 UI 鍥炲綊娴嬭瘯銆?- 瑕嗙洊淇濆瓨澶辫触銆佸揩鐓ф仮澶嶅け璐ャ€佸揩鐓у垪琛ㄥけ璐ュ拰 StudyMate JSON 瀵煎叆鏍￠獙澶辫触锛岀‘淇濈敤鎴峰彲瑙佺姸鎬佹槑纭笖涓嶈瑙﹁繙绋嬩繚瀛樸€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岄€氳繃 mock graph API 娓叉煋鐪熷疄 `GraphWorkspacePage`銆?- 瑕嗙洊鎵归噺淇濆瓨澶辫触鏃跺睍绀洪敊璇秷鎭拰 `淇濆瓨澶辫触` 鐘舵€併€?- 瑕嗙洊蹇収鎭㈠澶辫触鏃跺睍绀洪敊璇秷鎭拰 `淇濆瓨澶辫触` 鐘舵€併€?- 瑕嗙洊蹇収鍒楄〃鍔犺浇澶辫触鏃朵粛鍙户缁紪杈戯紝骞朵繚鐣欌€滄殏鏃舵棤娉曟仮澶嶅巻鍙茬増鏈€濈殑鎻愮ず銆?- 瑕嗙洊 JSON 瀵煎叆缁撴瀯閿欒鏃跺睍绀哄け璐ョ姸鎬侊紝涓嶈皟鐢?`batchSaveGraph` 杩滅▼淇濆瓨銆?- 淇 `loadGraphWorkspace` / `openGraph` 鍦ㄥ揩鐓у垪琛ㄥ姞杞藉け璐ュ悗鍙堢敤鈥滃伐浣滃彴宸插氨缁?宸插垏鎹⑩€濊鐩栧け璐ユ彁绀虹殑闂銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx` 鍏堟毚闇插揩鐓у垪琛ㄥけ璐ユ彁绀鸿瑕嗙洊鐨勯棶棰橈紝淇鍚庨€氳繃锛? 涓〉闈㈢骇鐢ㄤ緥鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/GraphWorkspacePage.test.tsx src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃锛? 涓枃浠躲€?6 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨宸ヤ綔鍖轰繚瀛?蹇収/瀵煎叆澶辫触璺緞鐜板湪鍏峰鐪熷疄 UI 鍥炲綊淇濇姢锛涗笅涓€姝ラ€傚悎琛ラ敭鐩?鏉ユ簮鍙嶉摼/鍗＄墖鑽夌娴佺▼鐨勯〉闈㈢骇鐢ㄤ緥锛屾垨缁х画鎷?controller 鐨勫姞杞?store 杈圭晫銆?
## 2026-06-05 10:01:08 +08:00 | v1.1.0-alpha.25 | 鎶藉嚭鍥捐氨淇濆瓨銆佺椤典繚鎶や笌蹇収鎭㈠鐘舵€佽竟鐣?### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸 autosave/dirty/snapshot 鐩稿叧鐘舵€佹枃妗堜粠澶у瀷 controller 涓笅娌変负鍙祴璇?helper銆?- 寮哄寲淇濆瓨鐘舵€佺殑鍙鎬э紝纭繚淇濆瓨鎴愬姛/澶辫触銆佸揩鐓ф仮澶嶆垚鍔?澶辫触銆佸揩鐓у垪琛ㄥ姞杞藉け璐ュ拰绂婚〉淇濇姢閮芥湁鏄庣‘鐘舵€佽〃杈俱€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphPersistenceState.ts` 涓庢祴璇曪紝瑕嗙洊绂婚〉淇濇姢鏂囨銆佷繚瀛樻垚鍔?澶辫触鐘舵€併€佸揩鐓ф仮澶嶆垚鍔?澶辫触鐘舵€併€佸揩鐓у垪琛ㄥけ璐ユ彁绀哄拰淇濆瓨鐘舵€佷腑鏂囨爣绛俱€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屼繚瀛樺拰蹇収鎭㈠璺緞澶嶇敤 persistence helper锛涘揩鐓ф仮澶嶆垚鍔熻繘鍏?`saved`锛屽け璐ヨ繘鍏?`failed`銆?- `loadSnapshots` 鐜板湪杩斿洖鍔犺浇鏄惁鎴愬姛锛涗繚瀛樻垨鎭㈠鍚庡鏋滃揩鐓у垪琛ㄥ姞杞藉け璐ワ紝浼氫繚鐣欌€滃彲缁х画缂栬緫浣嗘殏鏃舵棤娉曟仮澶嶅巻鍙茬増鏈€濈殑娓呮櫚鎻愮ず銆?- 椤堕儴淇濆瓨鐘舵€佷粠鑻辨枃鏋氫妇 `idle/dirty/pending/saved/failed` 鏀逛负涓枃鍙鏍囩锛屽苟鍚屾鏇存柊 `aria-label`銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphPersistenceState.test.ts` 鍏堝洜 helper 缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃锛涙柊澧炰繚瀛樼姸鎬?label 娴嬭瘯涔熷厛澶辫触鍚庤浆缁裤€?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphPersistenceState.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃锛? 涓枃浠躲€?4 涓敤渚嬪叏閮ㄩ€氳繃銆?### 鍚庣画褰卞搷
- autosave/dirty/snapshot 鐘舵€佽竟鐣屽凡缁忓叿澶囩函閫昏緫娴嬭瘯淇濇姢锛涗笅涓€姝ラ€傚悎缁х画琛ュ浘璋卞伐浣滃尯椤甸潰绾ф祴璇曪紝瑕嗙洊淇濆瓨澶辫触銆佸揩鐓ф仮澶嶅け璐ュ拰绂婚〉淇濇姢鐨勭湡瀹?UI 琛屼负銆?
## 2026-06-05 09:55:04 +08:00 | v1.1.0-alpha.24 | 鍔犲己鍥捐氨楠岃瘉闈㈡澘涓庢潵婧愬绔嬭妭鐐规憳瑕?### 浠诲姟鍐呭
- 缁х画瀹屽杽鐭ヨ瘑鍥捐氨宸ヤ綔鍖虹殑 validation panel 涓?source summary锛岃楠岃瘉缁撴灉涓嶅啀鍙槸骞抽摵 issue锛屾潵婧愭憳瑕佷篃鑳芥樉绀哄绔?鏃犳潵婧愯妭鐐规儏鍐点€?- 鎸?TDD 鍏堣ˉ graph-core 鏉ユ簮鎽樿娴嬭瘯鍜屽墠绔?validation panel helper 娴嬭瘯锛屽啀瀹炵幇骞跺洖鎺ュ伐浣滃尯闈㈡澘銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `packages/graph-core/src/index.ts` 鐨?`summarizeGraphSourceReferences`锛屾柊澧?`isolatedNodeCount`銆乣isolatedNodeIds`銆乣missingSourceNodeCount` 鍜?`missingSourceNodeIds`锛屽苟鍦?`sourceSwimlaneLayout.test.ts` 瑕嗙洊鑷敱鑺傜偣缁熻銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphValidationPanel.ts` 涓庢祴璇曪紝鎸?severity 鍜?ruleType 姹囨€婚獙璇佺粨鏋滐紝鐢熸垚閿欒/璀﹀憡/鎻愮ず璁℃暟鍜岃鍒欏垎缁勩€?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspacePanels.tsx`锛宍GraphValidationIssueList` 鍏堟樉绀洪獙璇佹憳瑕佷笌瑙勫垯鍒嗙粍锛屽啀淇濈暀鍘熸湁 issue 鏄庣粏鍜岀┖鐘舵€併€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾潵婧愭憳瑕侀潰鏉挎樉绀衡€滃绔?鏃犳潵婧愨€濊妭鐐规暟閲忥紝鍗充娇褰撳墠鍥捐氨娌℃湁浠讳綍鏉ユ簮寮曠敤涔熻兘灞曠ず杩欎竴鐘舵€併€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 鍏堝洜鏉ユ簮鎽樿缂哄皯瀛ょ珛鑺傜偣瀛楁澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃锛?6 涓?graph-core 娴嬭瘯鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphValidationPanel.test.ts` 鍏堝洜 helper 缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphValidationPanel.test.ts` 鍏堝洜楠岃瘉闈㈡澘鏈樉绀烘憳瑕佸け璐ワ紝琛ュ疄鐜板悗閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphValidationPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/lib/graphSourceBacklinks.test.ts` 閫氳繃锛? 涓枃浠躲€?1 涓敤渚嬪叏閮ㄩ€氳繃銆?### 鍚庣画褰卞搷
- 楠岃瘉闈㈡澘涓庢潵婧愭憳瑕佺幇鍦ㄩ兘鍏峰鏇存槑纭殑浜у搧鐘舵€佽〃杈撅紱涓嬩竴姝ラ€傚悎缁х画鎷?autosave/dirty/snapshot 娴佺▼锛岃ˉ淇濆瓨澶辫触鍜屽揩鐓ф仮澶嶅け璐ョ殑鍓嶇娴嬭瘯銆?
## 2026-06-05 09:48:40 +08:00 | v1.1.0-alpha.23 | 鏀舵暃鍥捐氨璁剧疆闈㈡澘閰嶇疆涓庢覆鏌撹竟鐣?### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸璁剧疆闈㈡澘涓殑鏄剧ず鍋忓ソ銆佸鍏ュ鍑恒€佽嚜鍔ㄤ繚瀛樸€佹€ц兘鎻愮ず鍜屽揩鎹烽敭璇存槑鏀舵暃涓虹粨鏋勫寲閰嶇疆涓庡彲澶嶇敤缁勪欢銆?- 鎸?TDD 鍏堣ˉ璁剧疆閰嶇疆鍜岄潰鏉跨粍浠舵祴璇曪紝鍐嶅疄鐜板苟鎺ュ叆宸ヤ綔鍖哄彸渚ф爮銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphSettingsPanel.ts` 涓庢祴璇曪紝鍥哄畾璁剧疆闈㈡澘浜旂被 product section锛屽苟鏍规嵁鑺傜偣/杈?鍒嗙粍鏁伴噺鍜屼繚瀛樼姸鎬佺敓鎴愯嚜鍔ㄤ繚瀛樹笌鎬ц兘鎻愮ず銆?- 鎵╁睍 `frontend-user/src/modules/graph/components/GraphWorkspacePanels.tsx`锛屾柊澧?`GraphSettingsPanel` 缁勪欢锛岄伩鍏嶇户缁湪澶у瀷 controller 涓‖缂栫爜璁剧疆璇存槑 JSX銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾牴鎹綋鍓嶅浘璋辫妯°€佷繚瀛樼姸鎬佸拰 autosave delay 鐢熸垚 settings sections锛屽苟鍦ㄥ彸渚ф爮灞曠ず鈥滆缃?/ 鍋忓ソ涓庤鏄庘€濆尯鍧椼€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSettingsPanel.test.ts` 鍏堝洜 helper 缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/components/GraphWorkspacePanels.test.tsx` 鍏堝洜 `GraphSettingsPanel` 鏈鍑哄け璐ワ紝琛ュ疄鐜板悗閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSettingsPanel.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/modules/graph/lib/graphSourceBacklinks.test.ts src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 閫氳繃锛? 涓枃浠躲€?3 涓敤渚嬪叏閮ㄩ€氳繃銆?### 鍚庣画褰卞搷
- 璁剧疆璇存槑宸茬粡浠?controller 涓笅娌変负鍙祴璇曡竟鐣岋紱涓嬩竴姝ラ€傚悎缁х画鎶?validation panel 鍜?autosave/snapshot 娴佺▼鎷嗕负鐙珛妯″潡锛屽苟琛ユ洿瀹屾暣鐨勫伐浣滃尯浜や簰娴嬭瘯銆?
## 2026-06-05 09:42:46 +08:00 | v1.1.0-alpha.22 | 琛ラ綈鍥捐氨鏉ユ簮鍙嶉摼鍒版壒娉ㄣ€丳DF 椤靛拰 AI 鑽夌
### 浠诲姟鍐呭
- 缁х画瀹屽杽鐭ヨ瘑鍥捐氨瀛︿範闂幆锛岃鍥捐氨鑺傜偣鍜屾潵婧愭憳瑕侀潰鏉垮彲浠ユ洿绋冲畾鍦板洖鍒拌祫鏂欍€佺瑪璁般€丳DF 鎵规敞銆佸崱鐗囧拰 AI 涓婁笅鏂囥€?- 鎸?TDD 鍏堣ˉ鍓嶇鏉ユ簮鍙嶉摼 helper 娴嬭瘯鍜屽悗绔?reader graph draft metadata 娴嬭瘯锛屽啀瀹炵幇骞跺洖鎺ュ浘璋卞伐浣滃尯涓?ReaderPage銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphSourceBacklinks.ts` 涓庢祴璇曪紝缁熶竴瑙ｆ瀽 material銆乶ote銆乧ard銆乤nnotation銆乸df-anchor銆乤i_draft銆乤i_task 绛夋潵婧愮被鍨嬬殑璺宠浆鐩爣涓庢寜閽枃妗堛€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屽彸閿彍鍗曘€佽妭鐐硅鎯呭拰鏉ユ簮鎽樿鍒楄〃閮藉鐢ㄥ悓涓€鏉ユ簮鍙嶉摼 helper锛涘彲瑙ｆ瀽鏉ユ簮浼氱洿鎺ユ樉绀衡€滃洖鍒伴槄璇诲櫒/鍥炲埌鎵规敞/鏌ョ湅 AI 鑽夌鈥濈瓑鍏ュ彛銆?- 鏇存柊 `backend/internal/modules/reader/service/graph_drafts.go` 涓庢祴璇曪紝璁╀粠 PDF 鎵规敞鐢熸垚鐨勫浘璋辫崏绋胯妭鐐瑰甫涓?`materialId`銆乣annotationId` 鍜?`page` metadata锛岄伩鍏嶆壒娉ㄨ妭鐐瑰彧鏈?annotation id 鑰屾棤娉曞洖鍒板師璧勬枡椤点€?- 鏇存柊 `frontend-user/src/pages/ReaderPage.tsx` 涓庢祴璇曪紝鏀寔 `/reader/:materialId?page=...&annotation=...` 杩欑被浠庡浘璋卞弽閾捐繘鍏ョ殑鍒濆 PDF 椤佃惤鐐广€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSourceBacklinks.test.ts` 鍏堝洜 helper 缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `cd backend; go test ./internal/modules/reader/service` 鍏堝洜鎵规敞鑺傜偣 metadata 缂哄皯 `materialId/page/annotationId` 澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- --run src/pages/ReaderPage.test.tsx` 鍏堝洜 page query 鏈敓鏁堝け璐ワ紝琛ュ疄鐜板悗閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphSourceBacklinks.test.ts src/modules/graph/lib/graphKeyboardShortcuts.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx src/pages/ReaderPage.test.tsx` 閫氳繃锛? 涓枃浠躲€?7 涓敤渚嬪叏閮ㄩ€氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鏉ユ簮鍙嶉摼宸茬粡瑕嗙洊瀛︿範闂幆閲岀殑鍏抽敭瀵硅薄锛涘悗缁彲缁х画鎶?settings panel銆乿alidation panel 鍜?autosave/snapshot 杈圭晫浠?controller 涓媶鍑猴紝骞惰ˉ UI smoke 瑕嗙洊鏉ユ簮鎸夐挳瀹為檯鐐瑰嚮銆?
## 2026-06-05 01:00:00 +08:00 | v1.1.0-alpha.21 | 鎶藉嚭鍥捐氨宸ヤ綔鍖洪敭鐩樺揩鎹烽敭鎰忓浘瑙ｆ瀽
### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸 keydown 浜嬩欢涓殑蹇嵎閿鍒欐娊鎴愬彲娴嬭瘯鐨勬剰鍥捐В鏋?helper銆?- 淇濈暀鍘熸湁淇濆瓨銆佹挙閿€/閲嶅仛銆佸叏閫夈€佸垹闄ゃ€佽仛鐒︺€佸垎缁勩€佽繛绾裤€侀噸缃閲庡拰 Escape 琛屼负锛屽彧鎶婃寜閿垽鏂粠 React effect 涓Щ鍑恒€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/graph/lib/graphKeyboardShortcuts.test.ts`锛岃鐩栬緭鍏ユ鍐呭鐨勪繚瀛?history/鍏ㄩ€?鍒犻櫎/鐒︾偣/鍒嗙粍/杩炵嚎/瑙嗛噹閲嶇疆/Escape 瑙勫垯銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphKeyboardShortcuts.ts`锛屽鍑?`resolveGraphKeyboardShortcut` 鍜屾槑纭殑 shortcut action union銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃 keydown effect 鍏堣В鏋?action 鍐嶆墽琛?UI 鍓綔鐢紝鍑忓皯澶у瀷 hook 鍐呴儴鏉′欢鍒嗘敮銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphKeyboardShortcuts.test.ts` 鍏堝洜 helper 鏂囦欢缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphKeyboardShortcuts.test.ts src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃锛? 涓枃浠躲€?5 涓敤渚嬪叏閮ㄩ€氳繃銆?### 鍚庣画褰卞搷
- 蹇嵎閿鍒欏凡鍏峰鍗曞厓娴嬭瘯淇濇姢锛涘悗缁彲缁х画鎶?source backlinks銆乻ettings panel銆佸鍏?淇濆瓨杈圭晫浠?controller 涓媶鎴愭洿灏忔ā鍧椼€?
## 2026-06-05 00:56:07 +08:00 | v1.1.0-alpha.20 | 涓嬫矇鍥捐氨鑺傜偣銆佽竟涓庡垎缁?mutation 绾€昏緫
### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸鍒犻櫎鑺傜偣銆佸垱寤鸿繛绾裤€佸鍒惰妭鐐广€佸垱寤哄垎缁勫拰鎶樺彔鍒嗙粍鐨勬枃妗?mutation 涓嬫矇鍒?`@studymate/graph-core`銆?- 鎸?TDD 鍏堣ˉ graph-core mutation 娴嬭瘯锛屽啀瀹炵幇涓嶅彲鍙?helper 骞跺洖鎺ョ敤鎴风 controller銆?### 瀹屾垚缁撴灉
- 鏂板 `packages/graph-core/test/graphMutations.test.ts`锛岃鐩栧垹闄よ妭鐐规椂娓呯悊杈瑰拰鍒嗙粍銆佽繛绾垮幓閲嶃€佸鍒惰妭鐐?metadata/source 鎷疯礉涓庤垶鍙拌竟鐣岄挸鍒躲€佹寜閫変腑鑺傜偣 bounds 鍒涘缓鍒嗙粍銆佸垎缁勬姌鍙犲垏鎹€?- 鎵╁睍 `packages/graph-core/src/index.ts`锛屾柊澧?`removeGraphNodesFromDocument`銆乣appendGraphNodeToDocument`銆乣appendGraphEdgeToDocument`銆乣duplicateGraphNodeInDocument`銆乣createGraphGroupForNodes` 鍜?`toggleGraphGroupCollapse`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃鍒犻櫎銆佽繛绾裤€佸鍒躲€佸垎缁勫拰鎶樺彔鎿嶄綔澶嶇敤 graph-core mutation helper锛岀户缁噺灏?controller 鍐呴儴鎵嬪啓鏂囨。鏀瑰啓鍒嗘敮銆?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 鍏堝洜 mutation helper 鏈鍑哄け璐ワ紝琛ュ疄鐜板悗閫氳繃锛?6 涓?graph-core 娴嬭瘯鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃銆?### 鍚庣画褰卞搷
- 鑺傜偣/杈?鍒嗙粍鐨勬牳蹇冩枃妗?mutation 宸插叿澶?UI 鏃犲叧娴嬭瘯淇濇姢锛涗笅涓€姝ラ€傚悎缁х画鎷?keyboard shortcut 瑙勫垯銆乻ettings/source panel 閫昏緫鍜屽墿浣欏鍏?淇濆瓨杈圭晫銆?
## 2026-06-05 00:47:28 +08:00 | v1.1.0-alpha.19 | 涓嬫矇鍥捐氨 viewport 涓?minimap 鐩告満閫昏緫
### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸 viewport/camera/minimap 鐨勫潗鏍囨姇褰变笌瑙嗛噹璁＄畻涓嬫矇鍒?`@studymate/graph-core`銆?- 鎸?TDD 鍏堣ˉ graph-core viewport 娴嬭瘯锛屽啀瀹炵幇绾€昏緫 helper 骞跺洖鎺ョ敤鎴风 controller 涓?workspace helper銆?### 瀹屾垚缁撴灉
- 鏂板 `packages/graph-core/test/graphViewport.test.ts`锛岃鐩?zoom clamp銆佺煩褰㈠眳涓€乧lient point 鍒板浘璋卞潗鏍囨姇褰便€乵inimap viewport 鏄犲皠鍜屼笉鍙祴鑸炲彴灏哄鍏滃簳銆?- 鎵╁睍 `packages/graph-core/src/index.ts`锛屾柊澧?`GraphViewport`銆乣GraphRect`銆乣GraphStageSize`銆乣clampGraphZoom`銆乣centerGraphViewportOnRect`銆乣projectClientPointToGraph` 鍜?`buildGraphMinimapViewport`銆?- 鏇存柊 `frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts` 涓?`frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃缂╂斁闄愬埗銆佽仛鐒﹁妭鐐广€佹嫋鎷芥姇褰卞拰 minimap 瑙嗗彛澶嶇敤 graph-core helper銆?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 閫氳繃锛?1 涓?graph-core 娴嬭瘯鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃銆?### 鍚庣画褰卞搷
- viewport/camera 宸叉垚涓哄彲澶嶇敤绾€昏緫杈圭晫锛涗笅涓€姝ラ€傚悎缁х画鎷?node/edge/group mutations銆乲eyboard shortcut 瑙勫垯鍜?settings/source panel 閫昏緫銆?
## 2026-06-05 00:40:55 +08:00 | v1.1.0-alpha.18 | 涓嬫矇鍥捐氨 selection 涓?marquee 绾€昏緫
### 浠诲姟鍐呭
- 缁х画鎷嗗垎 `useGraphWorkspaceController.tsx`锛屾妸 selection / marquee 鍛戒腑閫昏緫浠庡ぇ鍨?hook 涓笅娌夊埌 `@studymate/graph-core`銆?- 鎸?TDD 鍏堣ˉ graph-core 閫夋嫨鎬佹祴璇曪紝鍐嶅疄鐜板苟鍥炴帴鐢ㄦ埛绔?controller銆?### 瀹屾垚缁撴灉
- 鏂板 `packages/graph-core/test/graphSelection.test.ts`锛岃鐩栧崟閫夈€佹竻绌恒€佸閫?toggle銆佺┖ ID 蹇界暐銆佹閫夌煩褰㈠弽鍚戝綊涓€鍜岄殣钘忚妭鐐硅繃婊ゃ€?- 鎵╁睍 `packages/graph-core/src/index.ts`锛屾柊澧?`GraphSelectionState`銆乣createGraphSelectionState`銆乣setGraphNodeSelection`銆乣clearGraphNodeSelection`銆乣toggleGraphNodeSelection` 鍜?`selectGraphNodesInRect`銆?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛岃鍗曢€夈€佹竻绌恒€佸鍑忛€夋嫨鍜屾閫夊懡涓鐢?graph-core helper锛屽噺灏?hook 鍐呴儴鎵嬪啓鐘舵€佸垎鏀€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 鍏堝洜 selection helper 鏈鍑哄け璐ワ紝琛ュ疄鐜板悗閫氳繃锛?6 涓?graph-core 娴嬭瘯鍏ㄩ儴閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts src/modules/graph/lib/graphHistory.test.ts src/modules/graph/components/GraphWorkspacePanels.test.tsx` 閫氳繃銆?### 鍚庣画褰卞搷
- selection / marquee 宸叉垚涓哄彲澶嶇敤绾€昏緫杈圭晫锛涗笅涓€姝ュ彲缁х画鎸夊悓鏍锋柟寮忔媶 camera/viewport銆乶ode/edge/group mutations 鍜?keyboard shortcut 瑙勫垯銆?
## 2026-06-05 00:29:33 +08:00 | v1.1.0-alpha.17 | 鍥捐氨宸ヤ綔鍖?JSON 鏂囦欢銆侀獙璇佽鍒欎笌 200 鑺傜偣 smoke
### 浠诲姟鍐呭
- 寤剁画鍥捐氨浜у搧鍖栨敹鍙ｏ紝鎸?TDD 鍏堣ˉ `@studymate/graph-core` 绾€昏緫娴嬭瘯锛屽啀瀹炵幇鏂囨。瑙勮寖鍖栥€侀獙璇佽鍒欍€乣.smtg` 瀵煎叆瀵煎嚭銆佸涔犳ā鏉裤€乭istory label 鍜屽熀鍑嗗す鍏枫€?- 鍦ㄤ笉鐮村潖鐜版湁 Graph API 鍚堢害鐨勫墠鎻愪笅锛屾墿灞曞悗绔?`ValidateGraph` 瑙勫垯鍜屽涔犳ā鏉垮唴瀹广€?- 鐢ㄦ埛绔帴鍏?StudyMate JSON 瀵煎叆瀵煎嚭銆佹槑纭?`idle/dirty/pending/saved/failed` 淇濆瓨鐘舵€併€佺椤典繚鎶ゅ拰鍥捐氨 200 鑺傜偣 E2E smoke銆?### 瀹屾垚缁撴灉
- 鏂板 `packages/graph-core/test/graphProductization.test.ts`锛岃鐩?normalize銆乿alidate銆丼MTG JSON 寰€杩斻€乭istory label銆佸洓绫诲涔犳ā鏉垮拰 200/300/20 鍩哄噯澶瑰叿銆?- 鎵╁睍 `packages/graph-core/src/index.ts`锛屾柊澧?graph document clone/normalize銆乣validateGraphDocument`銆乣serializeStudymateGraphJson`銆乣parseStudymateGraphJson`銆乭istory state銆佸涔犳ā鏉裤€佸熀鍑嗘暟鎹拰瀹夊叏鏂囦欢鍚嶈兘鍔涖€?- 鎵╁睍 `backend/internal/modules/graph/service/helpers.go` 涓庢祴璇曪紝楠岃瘉瀛ょ珛鑺傜偣銆佺己鏉ユ簮銆侀噸澶嶆爣棰樸€佹偓鎸傝竟銆佽法鎶樺彔鍒嗙粍杈广€佺┖鍒嗙粍銆侀潪娉曞昂瀵稿拰鏃犳晥鏉ユ簮 target锛涙ā鏉夸粠 UML/ERD/C4 鏇挎崲涓哄涔犺祫鏂欐⒊鐞嗐€佽涔︾瑪璁般€佹蹇电綉缁溿€佸涔犲崱鐗囧噯澶囥€?- 鏂板 `frontend-user/src/modules/graph/lib/graphFileImportExport.ts` 涓庢祴璇曪紝鎺ュ叆 `.smtg` / `application/vnd.studymate.graph+json` 瀵煎叆瀵煎嚭锛涘伐浣滃尯鏂板 JSON 瀵煎叆妯″紡銆丣SON 瀵煎嚭鎸夐挳銆佷繚瀛樼姸鎬併€佺椤靛墠淇濇姢鍜屾洿娓呮櫚鐨勫涔犳ā鏉挎枃妗堛€?- 鏂板 `e2e/v1-graph-workspace.spec.ts`锛岄€氳繃鎷︽埅 API 鍔犺浇 200 鑺傜偣銆?00 杈广€?0 鍒嗙粍鍥捐氨锛岄獙璇佸浘璋卞伐浣滃尯鍙墦寮€骞跺睍绀?JSON 瀵煎嚭鍏ュ彛銆?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test` 鍏堝洜鏂板 API 鏈鍑哄け璐ワ紝琛ュ疄鐜板悗閫氳繃锛?2 涓祴璇曞叏閮ㄩ€氳繃銆?- `go test ./internal/modules/graph/service` 鍏堝洜楠岃瘉瑙勫垯鍜屾ā鏉夸粛涓烘棫瀹炵幇澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphFileImportExport.test.ts` 鍏堝洜 helper 缂哄け澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm run test:user` 閫氳繃锛岀敤鎴风 11 涓祴璇曟枃浠躲€?0 涓敤渚嬪叏閮ㄩ€氳繃銆?- `npm run build:user` 涓?`npm run build:admin` 閫氳繃銆?- `npx playwright test e2e/v1-graph-workspace.spec.ts` 閫氳繃锛岀‘璁?200 鑺傜偣鍥捐氨 smoke 鍙敤銆?- `npm run test:e2e` 閫氳繃锛? 鏉?Playwright smoke 鍏ㄩ儴閫氳繃銆?### 鍚庣画褰卞搷
- 鍥捐氨鏍稿績鑳藉姏宸茬粡浠庡ぇ hook 涓户缁绉诲埌鍙祴璇曠函閫昏緫杈圭晫锛涘悗缁€傚悎缁х画鎷?`useGraphWorkspaceController.tsx` 鐨勬暟鎹姞杞姐€佺敾甯冧氦浜掋€乿alidation/draft 鍜?settings 闈㈡澘銆?- `.prg` 鍏煎銆佸鐩爣杈?UI銆佸鏉傝嚜鍔ㄥ竷灞€銆佹彃浠跺競鍦恒€丆RDT銆乀auri 鍜?WebGL/Pixi 閲嶅啓浠嶆寜璁″垝寤跺悗锛涘闇€瑕?Project Graph 鏂囦欢鍏煎锛屽簲浠ュ悗缁浆鎹㈠櫒鐗堟湰瀹炵幇銆?
## 2026-06-02 23:08:40 +08:00 | v1.1.0-alpha.16 | 琛?Reader API銆侀〉闈€乭andler 涓?service 娴嬭瘯纭寲
### 浠诲姟鍐呭
- 寤剁画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝鍥寸粫闃呰鍣ㄩ摼璺ˉ榻愮敤鎴风 API 鍚堢害娴嬭瘯銆侀〉闈㈠洖褰掓祴璇曞拰鍚庣 handler / service 杈圭晫娴嬭瘯銆?- 缁х画閬靛惊 TDD锛氬厛璁╁悗绔?`reader/handler`銆乣reader/service` 鐨?fake 渚濊禆娴嬭瘯鍥犳敞鍏ヨ竟鐣屼笉瓒宠€岀紪璇戝け璐ワ紝鍐嶆敹绐勪緷璧栨帴鍙ｅ苟閲嶈窇鐩爣娴嬭瘯銆?- 鍚屾鏇存柊 README銆佽矾绾垮浘銆佺増鏈鍒掋€佸彉鏇磋褰曞拰椤圭洰鏃ュ織锛屽苟鍦ㄥ垏鐗囧畬鎴愬悗琛ヨ窇瀹屾暣 CI 涓庤鐩栫巼姹囨€汇€?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/api/reader.test.ts`锛岃鐩?`getReaderState`銆乣updateReaderProgress`銆乣createReaderAnnotation`銆乣deleteReaderAnnotation`銆乣generateAnnotationCardDrafts` 鍜?`generateAnnotationGraphDrafts` 鐨勯壌鏉冨ご銆佽矾寰勪笌璇锋眰浣撱€?- 鏂板 `frontend-user/src/pages/ReaderPage.test.tsx`锛岃鐩栭槄璇昏繘搴﹀洖鍐欍€佹坊鍔犱功绛俱€佷繚瀛樻壒娉ㄥ悗鍒锋柊鐘舵€侊紝浠ュ強璧勬枡鏍囬銆丳DF 椤电爜鍜?`rects` 鍧愭爣鐗囨鏉ユ簮灞曠ず銆?- 鏂板 `backend/internal/modules/reader/handler/handler_test.go`锛岃鐩?`UpdateProgress`銆乣CreateAnnotation` 鍜?`GenerateGraphDrafts` 鐨勯壌鏉冪敤鎴枫€乵aterial id銆佽姹備綋涓?success envelope銆?- 鏂板 `backend/internal/modules/reader/service/service_test.go`锛岃鐩栫┖鎵规敞鎷掔粷銆侀粯璁ら鑹蹭笌瀹¤璁板綍銆佹壒娉ㄩ€夋嫨缂哄彛鍜岃祫鏂欏彲瑙佹€ц竟鐣屻€?- 鏇存柊 `backend/internal/modules/reader/handler/handler.go` 涓?`backend/internal/modules/reader/service/service.go`锛屽皢瀵瑰叿浣?`Service` / repository / material / audit / AI service 鐨勪緷璧栨敹绐勪负鏈€灏忔帴鍙ｏ紝骞朵繚鐣欑紪璇戞湡鏂█锛屼究浜庡悗缁户缁ˉ fake 鎴?fixture 娴嬭瘯銆?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/reader/handler` 鍏堝洜 `NewHandler` 鍙帴鏀跺叿浣?service 鑰屾棤娉曟敞鍏?fake service锛屽舰鎴愮紪璇戞湡 RED锛涙敹绐勪负 `readerService` interface 鍚庨€氳繃銆?- `cd backend; go test ./internal/modules/reader/service` 鍏堝洜 `NewService` 鍙帴鏀跺叿浣?repository / material / audit 渚濊禆鑰屾棤娉曟敞鍏?fake锛屽舰鎴愮紪璇戞湡 RED锛涙敹绐勪负鏈€灏忔帴鍙ｅ悗閫氳繃銆?- `npm --workspace frontend-user run test -- --run src/api/reader.test.ts src/pages/ReaderPage.test.tsx` 閫氳繃锛岃鐩?Reader API 鍚堢害涓庨〉闈㈠洖褰?5 涓敤渚嬨€?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€? 鏉?Playwright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?- `npm run test:coverage` 閫氳繃锛涘綋鍓嶈鐩栫巼缂哄彛鏇存柊涓猴細`frontend-user` 姹囨€?`46.18%`銆乣frontend-admin` 姹囨€?`60.27%`锛屽悗绔?`reader/service` 鎻愬崌鍒?`40.6%`锛屼絾浠嶄笌 `note/service`銆乣card/service`銆乣graph/service`銆乣share/service` 绛?service/repository 鍖呬竴璧锋瀯鎴愪富瑕佺己鍙ｃ€?### 鍚庣画褰卞搷
- Reader 閾捐矾鐜板湪鍏峰 API client銆侀〉闈㈠眰銆乭andler 灞傚拰 service 灞傜殑鑷姩鍖栦繚鎶わ紝鍚庣画鍙户缁悜 `note/service` 鍙婃潵婧愯拷韪棴鐜ˉ fake / repository fixture 娴嬭瘯銆?- 鍓嶇涓庡悗绔暣浣撹鐩栫巼浠嶆槑鏄句綆浜?80%锛屽悗缁紭鍏堢户缁ˉ `ReaderPage.tsx`銆乣appShared.tsx`銆乣workspaceControllerHelpers.ts` 浠ュ強 reader/note/card/graph service 灞傜殑缁嗙矑搴﹀洖褰掋€?
## 2026-06-02 22:42:39 +08:00 | v1.1.0-alpha.15 | 鎶藉嚭 SearchIndexer 涓庡浘璋?history 鐘舵€佹満
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝鍦ㄤ笉鏀瑰彉鐜版湁鍏紑 API 濂戠害鐨勫墠鎻愪笅锛屼负鍚庣鎼滅储閾捐矾琛ュ彲鏇挎崲绱㈠紩杈圭晫銆?- 缁х画鎷嗗垎 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屼紭鍏堟妸 history/autosave/undo-redo 鐘舵€佽浆绉绘娊鎴愬彲娴嬭瘯绾€昏緫銆?- 鍚屾鏇存柊 README銆佽矾绾垮浘銆佺増鏈鍒掋€佸彉鏇磋褰曞拰椤圭洰鏃ュ織锛屽苟閲嶆柊璺?CI 涓庤鐩栫巼姹囨€汇€?### 瀹屾垚缁撴灉
- 鏂板 `backend/internal/modules/search/service/indexer.go`锛屽紩鍏ュ唴閮?`SearchIndexer` 鎶借薄锛岄粯璁ゅ疄鐜颁粛涓?MySQL fallback锛屼笉鏀瑰彉 `GET /api/v1/search` 璺敱濂戠害銆?- 鎵╁睍 `backend/internal/modules/search/service/service_test.go`锛岃ˉ grouped search 閫氳繃 fake indexer 鑱氬悎缁撴灉銆乴imit 榛樿鍊间笌閿欒閫忎紶娴嬭瘯銆?- 鏂板 `frontend-user/src/modules/graph/lib/graphHistory.ts` 涓?`frontend-user/src/modules/graph/lib/graphHistory.test.ts`锛岄攣瀹?history 鎹曡幏銆乺eset銆乽ndo/redo 涓?saved 鐘舵€佽浆绉汇€?- 鏇存柊 `frontend-user/src/modules/graph/hooks/useGraphWorkspaceController.tsx`锛屾妸 history/autosave/undo-redo 鐘舵€佸垏鍒?`graphHistory.ts` 涓?`shouldAutosaveGraph` 杈圭晫涓婏紝缁х画缂╁皬澶ф帶鍒跺櫒鍐呴儴鑱岃矗銆?### 楠岃瘉缁撴灉
- `go test ./internal/modules/search/service` 鍏堝洜缂哄皯 `NewServiceWithIndexer` 缂栬瘧澶辫触锛屽畬鎴?RED锛涜ˉ瀹炵幇鍚庨€氳繃銆?- `npm --workspace frontend-user run test -- --run src/modules/graph/lib/graphHistory.test.ts` 鍏堝洜缂哄皯 `graphHistory.ts` 澶辫触锛岃ˉ瀹炵幇鍚庨€氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€? 鏉?Playwright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?- `npm run test:coverage` 閫氳繃锛涘綋鏃惰鐩栫巼缂哄彛璁板綍涓猴細`frontend-user` 姹囨€?`44.49%`銆乣frontend-admin` 姹囨€?`60.27%`锛屽悗绔?`search/service` 鎻愬崌鍒?`56.4%`锛屼絾 `share/service`銆乣reader/service`銆乣note/service`銆乣card/service`銆乣graph/service` 绛?service/repository 浠嶉渶缁х画琛?fixture 娴嬭瘯銆?### 鍚庣画褰卞搷
- 鎼滅储閾捐矾鐜板湪宸茬粡鍏峰淇濇寔 MySQL fallback 涓嶅彉鐨勫悓鏃跺垏鎹㈠悗缁?adapter 鐨勮竟鐣岋紝涓嬩竴姝ラ€傚悎缁х画琛?`search/share` service 灞?fake 鎴?repository fixture銆?- 鍥捐氨宸ヤ綔鍖哄凡缁忓厛鎶?history/autosave/undo-redo 杩欎竴缁勭姸鎬佷粠澶ф帶鍒跺櫒涓嫀鍑烘潵锛屽悗缁彲娌垮悓涓€鏂瑰紡缁х画涓嬫矇鏁版嵁鍔犺浇銆佺敾甯冧氦浜掋€乿alidation/draft 涓庤缃潰鏉块€昏緫銆?## 2026-06-02 14:01:58 +08:00 | v1.1.0-alpha.14 | 琛ュ悗鍙版不鐞?Playwright smoke
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓虹鐞嗙鍚庡彴娌荤悊琛?Playwright smoke銆?- 璁?E2E 鍚屾椂鍚姩鐢ㄦ埛绔拰绠＄悊绔?preview锛岃鐩栫鐞嗙宸叉湁 admin session 涓嬬殑 users 娌荤悊妯″潡鍔犺浇銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `e2e/v1-admin-governance.spec.ts`銆?- 鏇存柊 `package.json` 鐨?`test:e2e`锛屽悓鏃舵瀯寤虹敤鎴风鍜岀鐞嗙銆?- 鏂板 `frontend-admin` 鐨?`preview` 鑴氭湰锛屽苟鎶?`playwright.config.ts` 鏀逛负鍚屾椂鍚姩 4173 鐢ㄦ埛绔拰 4174 绠＄悊绔?preview銆?- 鍚庡彴 smoke 閫氳繃 `localStorage` 鍐欏叆 `studymate.admin.session`锛屾嫤鎴?`/api/v1/admin/me`銆乣/overview`銆乣/moderation` 鍜?`/users?limit=20`锛岄獙璇?users 妯″潡鍔犺浇 `alice` 涓旇姹傛惡甯?`Bearer admin-token`銆?### 楠岃瘉缁撴灉
- `npm run test:e2e` 閫氳繃锛孭laywright smoke 浠?4 鏉℃墿灞曚负 5 鏉°€?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€? 鏉?Playwright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- v1.1 宸茶鐩栧叕鍏遍〉銆佸涔犻槦鍒楀拰鍚庡彴娌荤悊鐨勫叧閿?smoke锛屽悗缁彲缁х画琛?AI 浠诲姟娌荤悊銆佽祫鏂欐枃浠舵不鐞嗘垨鍥捐氨鍙椾繚鎶ゅ伐浣滄祦銆?
## 2026-06-02 13:55:57 +08:00 | v1.1.0-alpha.13 | 琛ュ涔犻槦鍒?Playwright smoke
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓哄彈淇濇姢鐨勭敤鎴风 `/review` 澶嶄範闃熷垪琛?Playwright smoke銆?- 鐢ㄦ祴璇曞唴 session 鍜?API 鎷︽埅瑕嗙洊鍒版湡鍗＄墖灞曠ず銆佺炕闈€丟ood 璇勫垎鍜屽涔犲洖鍐欒姹傘€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `e2e/v1-review-flow.spec.ts`銆?- 閫氳繃 `localStorage` 鍐欏叆 `studymate.session`锛岄獙璇佸彈淇濇姢璺敱涓嶄緷璧栫湡瀹炵櫥褰曞嵆鍙繘鍏ュ涔犻〉銆?- 鎷︽埅 `/api/v1/decks`銆乣/api/v1/decks/:id/cards`銆乣/api/v1/review/today` 鍜?`/api/v1/cards/:id/review`銆?- 楠岃瘉鍥炲啓璇锋眰鎼哄甫 `Bearer access-token`锛屽苟鎻愪氦 `{ rating: "good" }`銆?### 楠岃瘉缁撴灉
- `npm run test:e2e` 閫氳繃锛孭laywright smoke 浠?3 鏉℃墿灞曚负 4 鏉°€?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€? 鏉?Playwright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 澶嶄範闂幆鐜板湪鍚屾椂鍏峰鐢ㄦ埛绔?API 鍚堢害銆侀〉闈㈢骇 Vitest銆佸悗绔?handler 娴嬭瘯鍜?Playwright smoke锛涘悗缁彲缁х画琛ュ悗鍙版不鐞?smoke銆?
## 2026-06-02 13:47:00 +08:00 | v1.1.0-alpha.12 | 琛ュ悗绔?AI handler 杈圭晫娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓哄悗绔?AI handler 琛?tasks銆乽sage 鍜?drafts 璇诲彇鍏ュ彛娴嬭瘯銆?- 鍏堟坊鍔?fake service handler 娴嬭瘯褰㈡垚缂栬瘧鏈?RED锛屽啀鎶?AI handler 浠庡叿浣?service 渚濊禆鏀剁獎涓烘渶灏忔帴鍙ｃ€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `backend/internal/modules/ai/handler/handler_test.go`銆?- 娴嬭瘯 `/ai/tasks`銆乣/ai/usage`銆乣/ai/drafts` 鍧囦娇鐢ㄨ璇佺敤鎴疯皟鐢?service锛屽苟杩斿洖 success envelope銆?- 鏇存柊 `backend/internal/modules/ai/handler/handler.go`锛屽厑璁搁€氳繃鏈€灏?`aiService` interface 娉ㄥ叆 fake锛屽悓鏃朵繚鐣欑湡瀹?AI service 鐨勮矾鐢卞吋瀹广€?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/ai/handler` 鍏堝洜 `NewHandler` 鍙帴鍙楀叿浣?service 缂栬瘧澶辫触锛屽畬鎴?RED銆?- `cd backend; go test ./internal/modules/ai/handler` 鍦ㄦ帴鍙ｆ敹绐勫悗閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- AI tasks/usage/drafts 璇诲彇鍏ュ彛鍏峰鍚庣 handler 灞備繚鎶わ紝鍚庣画鍙户缁ˉ AI service repository fixture 鎴栧悗鍙?AI 浠诲姟娌荤悊 smoke銆?
## 2026-06-02 13:42:00 +08:00 | v1.1.0-alpha.11 | 琛ュ悗绔?graph commit handler 杈圭晫娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓哄悗绔?graph handler 琛ュ浘璋卞彉鏇磋崏绋跨‘璁ゅ叆鍙ｆ祴璇曘€?- 鍏堟坊鍔?fake service handler 娴嬭瘯褰㈡垚缂栬瘧鏈?RED锛屽啀鎶?graph handler 浠庡叿浣?service 渚濊禆鏀剁獎涓烘渶灏忔帴鍙ｃ€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `backend/internal/modules/graph/handler/handler_test.go`銆?- 娴嬭瘯 `POST /graphs/:id/ai/commit-changes` 浼氫紶閫掕璇佺敤鎴枫€佺洰鏍?graph id銆乣draftIds` 鍜岄€愯崏绋?`nodeSelections`銆?- 鏇存柊 `backend/internal/modules/graph/handler/handler.go`锛屽厑璁搁€氳繃鏈€灏?`graphService` interface 娉ㄥ叆 fake锛屽悓鏃朵繚鐣欑湡瀹?`graphservice.Service` 鐨勮矾鐢卞吋瀹广€?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/graph/handler` 鍏堝洜 `NewHandler` 鍙帴鍙楀叿浣?service 缂栬瘧澶辫触锛屽畬鎴?RED銆?- `cd backend; go test ./internal/modules/graph/handler` 鍦ㄦ帴鍙ｆ敹绐勫悗閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍥捐氨鍙樻洿鑽夌纭鐨勫墠绔〉闈€佸墠绔?API 鍚堢害鍜屽悗绔?handler 杈圭晫鍧囨湁鑷姩鍖栦繚鎶わ紝鍚庣画鍙户缁ˉ graph service/repository fixture銆?
## 2026-06-02 13:37:49 +08:00 | v1.1.0-alpha.10 | 琛ュ浘璋卞彉鏇磋崏绋跨‘璁?API 鍚堢害娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓虹敤鎴风 AI/graph 鑽夌纭閾捐矾琛?API client 鍚堢害娴嬭瘯銆?- 閿佸畾 `commitGraphChangeDraftSelection` 鐨?endpoint銆丠TTP method銆侀壌鏉冨ご鍜岃姹備綋銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `frontend-user/src/api/reviewAi.test.ts`銆?- 鏂板鍥捐氨鍙樻洿鑽夌纭鐢ㄤ緥锛岃皟鐢?`/api/v1/graphs/graph-1/ai/commit-changes`銆?- 楠岃瘉璇锋眰浣撲繚鐣?`draftIds` 鍜岄€愯崏绋?`nodeSelections`锛岀‘淇濋〉闈㈤€夋嫨鐨勫€欓€夎妭鐐逛笉浼氬湪 API 灞傝涓㈠け銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/api/reviewAi.test.ts` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- AI 鍥捐氨鑽夌纭娴佺幇鍦ㄥ悓鏃跺叿澶?API 鍚堢害娴嬭瘯鍜岄〉闈㈢骇娴嬭瘯淇濇姢锛屽悗缁彲缁х画琛ュ悗绔?graph commit handler/service 鐨勭粏绮掑害 fixture銆?
## 2026-06-02 13:33:00 +08:00 | v1.1.0-alpha.9 | 琛?AiPage 鍥捐氨鍙樻洿鑽夌纭娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓虹敤鎴风 AiPage 琛ュ浘璋卞彉鏇磋崏绋跨‘璁ら〉闈㈡祴璇曘€?- 瑕嗙洊寰呯‘璁?`graph_change` 鑽夌鍐欏叆鎵€閫夌洰鏍囧浘璋辩殑 UI 娴併€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鎵╁睍 `frontend-user/src/pages/AiPage.test.tsx`銆?- 閫氳繃 mock API 鍒濆鍖栧浘璋卞彉鏇磋崏绋裤€佺洰鏍囧浘璋卞垪琛ㄥ拰鐩爣鍥捐氨璇︽儏銆?- 娴嬭瘯鍊欓€夎妭鐐瑰湪椤甸潰涓睍绀猴紝骞剁偣鍑烩€滄妸 1 鏉″浘璋卞彉鏇村啓鍏ユ墍閫夊浘璋扁€濄€?- 楠岃瘉 `commitGraphChangeDraftSelection` 鏀跺埌 `draftIds` 鍜?`nodeSelections`锛屼繚鐣?`node-a` 涓?`node-b` 鐨勮妭鐐归€夋嫨銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/pages/AiPage.test.tsx` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- AI 鑽夌鍒板涔犵郴缁熴€佸埌鐩爣鍥捐氨鐨勪袱涓‘璁ゆ祦閮芥湁椤甸潰绾ф祴璇曚繚鎶わ紝鍚庣画鍙户缁ˉ鍚庣 AI/graph commit handler/service 娴嬭瘯銆?
## 2026-06-02 12:47:00 +08:00 | v1.1.0-alpha.8 | 琛?AiPage 鑽夌纭椤甸潰娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓虹敤鎴风 AiPage 琛ラ〉闈㈢骇 AI 鍗＄墖鑽夌纭娴嬭瘯銆?- 瑕嗙洊寰呯‘璁?`card_draft` 鍐欏叆鎵€閫夊涔?deck 鐨?UI 娴併€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/pages/AiPage.test.tsx`銆?- 閫氳繃 mock API 鍒濆鍖?AI 鑽夌銆佺敤閲忔憳瑕併€乨eck 鍒楄〃鍜岀┖鍥捐氨鍒楄〃銆?- 娴嬭瘯鐢ㄦ埛鐐瑰嚮鈥滄妸 1 寮犲緟纭鍗＄墖鑽夌鍐欏叆澶嶄範绯荤粺鈥濆悗锛宍bulkCreateDeckCards` 鏀跺埌 draftId銆乫ront銆乥ack銆乻ourceType 鍜?sourceId銆?- 楠岃瘉纭瀹屾垚鍚庢樉绀衡€滃凡鎶?1 寮?AI 鑽夌鍐欏叆澶嶄範绯荤粺銆傗€濄€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/pages/AiPage.test.tsx` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- AI 鑽夌鍒板涔犵郴缁熺殑纭娴佸凡鏈?API 鍚堢害鍜岄〉闈㈢骇娴嬭瘯淇濇姢锛屽悗缁彲缁х画琛ュ浘璋卞彉鏇磋崏绋跨‘璁ゆ祦銆?
## 2026-06-02 12:43:00 +08:00 | v1.1.0-alpha.7 | 琛?ReviewWorkspace 椤甸潰绾у涔犲洖鍐欐祴璇?### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓虹敤鎴风 ReviewWorkspace 琛ラ〉闈㈢骇鍥炲綊娴嬭瘯銆?- 瑕嗙洊浠婃棩闃熷垪灞曠ず銆佹樉绀虹瓟妗堛€佽瘎鍒嗘寜閽拰澶嶄範鍥炲啓璋冪敤銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`銆?- 閫氳繃 mock API 鍒濆鍖栧崱缁勩€佸崱鐗囧垪琛ㄥ拰浠婃棩闃熷垪銆?- 娴嬭瘯鐢ㄦ埛鐐瑰嚮鈥滄樉绀虹瓟妗堚€濆悗鍙互鐪嬪埌绛旀锛屽苟鐐瑰嚮 `Good` 瑙﹀彂 `reviewCard`銆?- 楠岃瘉璇勫垎鍚庢樉绀衡€滃凡璁板綍澶嶄範鈥濇秷鎭苟娓呯┖浠婃棩闃熷垪銆?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/modules/review/ReviewWorkspacePage.test.tsx` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 澶嶄範闂幆宸叉湁 API 鍚堢害銆佸悗绔?handler 鍜岄〉闈㈢骇娴嬭瘯淇濇姢锛屽悗缁彲浠ョ户缁ˉ AI 鑽夌纭 UI 鎴栧悗绔?service fixture銆?
## 2026-06-02 12:39:00 +08:00 | v1.1.0-alpha.6 | 琛ュ悗绔?card handler 杈圭晫娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓哄涔?Card/Deck handler 琛ヨ竟鐣屾祴璇曘€?- 璁?card handler 鍙互閫氳繃 fake service 鍋氬崟鍏冩祴璇曪紝涓嶇洿鎺ヤ緷璧栫湡瀹炴暟鎹簱銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `backend/internal/modules/card/handler/handler_test.go`銆?- 瑕嗙洊鍒涘缓鍗＄粍鏃剁殑璁よ瘉鐢ㄦ埛銆佽姹備綋缁戝畾鍜?201 鍝嶅簲銆?- 瑕嗙洊浠婃棩澶嶄範闃熷垪鐨?success envelope 涓?due item銆?- 瑕嗙洊澶嶄範鍥炲啓鐨?card id銆乺ating 鍜?elapsedMs 浼犻€掋€?- `card/handler` 鐨?service 渚濊禆鏀逛负鏈€灏忔帴鍙ｏ紝骞朵繚鐣欏叿浣?service 鐨勭紪璇戞湡鎺ュ彛鏂█銆?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/card/handler` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 澶嶄範闂幆宸叉湁鐢ㄦ埛绔?API 鍚堢害娴嬭瘯鍜屽悗绔?handler 杈圭晫娴嬭瘯锛屽悗缁彲缁х画琛?ReviewWorkspace UI smoke 鎴?service 灞傛暟鎹簱 fixture銆?
## 2026-06-02 12:36:00 +08:00 | v1.1.0-alpha.5 | 琛?review/AI 鐢ㄦ埛绔?API 鍚堢害娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝涓哄涔犱笌 AI 鑽夌闂幆琛ョ敤鎴风 API client 鍚堢害娴嬭瘯銆?- 瑕嗙洊 Deck/Card銆佷粖鏃ュ涔犻槦鍒椼€佸涔犲洖鍐欏拰 AI tasks/usage/drafts 璇锋眰杈圭晫銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/api/reviewAi.test.ts`銆?- 瑕嗙洊 `createDeck` 鐨勮璇佸ご銆佸彲瑙佹€т笌璇锋眰杞借嵎銆?- 瑕嗙洊 `bulkCreateDeckCards` 浠?AI draft 鎵归噺纭鎴愬崱鐗囩殑璇锋眰杞借嵎銆?- 瑕嗙洊 `getTodayReviewQueue`銆乣reviewCard`銆乣listAiTasks`銆乣getAiUsageSummary`銆乣listAiDrafts` 鐨勮矾寰勪笌閴存潈澶淬€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/api/reviewAi.test.ts` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍚庣画鍙户缁ˉ review workspace UI smoke 鍜屽悗绔?card handler/service 娴嬭瘯锛岄€愭鎶婂涔犻棴鐜粠 API 鍚堢害鎺ㄨ繘鍒扮鍒扮鐢ㄦ埛娴併€?
## 2026-06-02 12:32:00 +08:00 | v1.1.0-alpha.4 | 鏀舵暃鍏叡棣栭〉 E2E 浠ｇ悊鍣０
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝鍑忓皯鍏叡棣栭〉 Playwright smoke 瀵规湰鍦板悗绔殑闅愬紡渚濊禆銆?- 淇濇寔褰撳墠鍏叡澹冲眰銆佹悳绱㈤〉鍜屽垎浜〉 smoke 浠嶅湪鍚屼竴鍓嶇棰勮鏈嶅姟涓嬭繍琛屻€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏇存柊 `e2e/user-shell.spec.ts`锛屽 `/api/v1/materials` 鍜?`/api/v1/posts` 澧炲姞绌烘垚鍔熷搷搴旀嫤鎴€?- Playwright 杩愯鏃朵笉鍐嶈緭鍑烘棤鏈湴鍚庣瀵艰嚧鐨?Vite proxy `ECONNREFUSED` 鍣０銆?### 楠岃瘉缁撴灉
- `npm run test:e2e` 閫氳繃锛? 鏉?Playwright smoke 鍧囬€氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍚庣画鏂板鍏叡椤?smoke 鏃跺簲浼樺厛鏄惧紡 mock API 杈圭晫锛岃 E2E 杈撳嚭鍙毚闇茬湡瀹炲け璐ャ€?
## 2026-06-02 12:29:00 +08:00 | v1.1.0-alpha.3 | 澧炲姞鎼滅储涓庡垎浜彧璇婚〉 Playwright smoke
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝琛ョ敤鎴风鍏叡鎼滅储鍜屽垎浜彧璇婚〉鐨勭鍒扮 smoke銆?- 閬垮厤渚濊禆鏈湴鍚庣锛屼娇鐢?Playwright route 鎷︽埅鍥哄畾 API 鍝嶅簲銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `e2e/v1-public-flows.spec.ts`銆?- 鎼滅储椤?smoke 瑕嗙洊 `/search?q=鍥捐氨` 璋冪敤 grouped backend result 骞舵樉绀虹粨鏋滃崱鐗囥€?- 鍒嗕韩椤?smoke 瑕嗙洊 `/share/token-1` 璋冪敤 public resolve 骞舵樉绀哄彧璇荤洰鏍囥€佹憳瑕佸拰鍘熷椤甸潰閾炬帴銆?### 楠岃瘉缁撴灉
- `npm run test:e2e` 閫氳繃锛孭laywright 浠?1 鏉″叕鍏卞３灞?smoke 鎵╁睍涓?3 鏉°€?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍚庣画鍙户缁ˉ鍚庡彴娌荤悊鍜屽涔犻槦鍒?Playwright smoke锛屽苟鎶婂悗绔唬鐞嗘嫆缁濇棩蹇椾粠鍏叡澹冲眰娴嬭瘯閲屾敹鏁涙帀銆?
## 2026-06-02 12:26:00 +08:00 | v1.1.0-alpha.2 | 琛ュ悗绔?search/share/admin handler 杈圭晫娴嬭瘯
### 浠诲姟鍐呭
- 缁х画 v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栵紝琛ュ悗绔?search/share/admin 鐨?handler 灞傚洖褰掓祴璇曘€?- 璁?search/share handler 鍙互閫氳繃 fake service 鍋氬崟鍏冩祴璇曪紝涓嶇洿鎺ヤ緷璧栫湡瀹炴暟鎹簱銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `backend/internal/modules/search/handler/handler_test.go`锛岃鐩栨煡璇㈠弬鏁般€佺被鍨嬭繃婊ゃ€乴imit 浼犻€掑拰閿欒 envelope銆?- 鏂板 `backend/internal/modules/share/handler/handler_test.go`锛岃鐩栧垱寤哄垎浜摼鎺ユ椂鐨勮璇佺敤鎴枫€佽姹備綋缁戝畾鍜屾垚鍔熷搷搴?envelope銆?- 鏂板 `backend/internal/modules/admin/handler/handler_test.go`锛岃鐩栧悗鍙?limit 鏌ヨ鍙傛暟瑙ｆ瀽銆?- `search/handler` 涓?`share/handler` 鐨?service 渚濊禆鏀逛负鏈€灏忔帴鍙ｏ紝骞朵繚鐣欏叿浣?service 鐨勭紪璇戞湡鎺ュ彛鏂█銆?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/search/handler ./internal/modules/share/handler ./internal/modules/admin/handler` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍚庣画鍙户缁寜鍚屼竴鏂瑰紡琛?review/AI/admin service 缁嗙矑搴︽祴璇曪紝骞跺湪闇€瑕佹暟鎹簱琛屼负鏃跺啀寮曞叆杞婚噺 fixture 鎴?repository interface銆?
## 2026-06-02 12:20:00 +08:00 | v1.1.0-alpha.1 | 鍔犲帤 search/share/admin 娴嬭瘯鍩虹嚎
### 浠诲姟鍐呭
- 鍦?`v1.0.0` 鏈湴鍙戝竷鏍囩涔嬪悗锛屾寜鍚庣画閲岀▼纰戣璁¤繘鍏?v1.1 浜у搧璐ㄩ噺涓庢祴璇曠‖鍖栥€?- 浼樺厛涓?v1 鏂板鐨勬悳绱€佸垎浜拰鍚庡彴娌荤悊鍏ュ彛琛ヨ嚜鍔ㄥ寲鍥炲綊娴嬭瘯銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 瀹屾垚缁撴灉
- 鏂板 `frontend-user/src/api/searchShare.test.ts`锛岃鐩?grouped search 鏌ヨ鍙傛暟銆侀壌鏉冨ご銆乷wner share link 鍒涘缓杞借嵎鍜?public token resolve 缂栫爜璺緞銆?- 鏂板 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃鐩栧凡鏈?admin session 涓嬫不鐞嗛〉鍔犺浇 `/api/v1/admin/users?limit=20` 骞舵惡甯?Bearer token銆?- README 褰撳墠闃舵浠?v1.0.0 鍙戝竷鎺ㄨ繘鏇存柊涓?v1.1 璐ㄩ噺纭寲锛涚増鏈鍒掑拰璺嚎鍥炬柊澧?v1.1 娴嬭瘯纭寲閫€鍑烘爣鍑嗐€?### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- --run src/api/searchShare.test.ts` 閫氳繃銆?- `npm --workspace frontend-admin run test -- --run src/views/AdminWorkspaceView.test.ts` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍚庣画鍙户缁ˉ鍚庣 search/share/admin/review handler/service 娴嬭瘯锛屽苟杩藉姞 Playwright 鎼滅储銆佸垎浜彧璇婚〉銆佸悗鍙版不鐞嗗拰澶嶄範闃熷垪 smoke flow銆?
## 2026-06-01 22:03:47 +08:00 | v0.0.73 | 鏀跺彛 NOTE_READ_MODEL銆佽鐩栫巼闂ㄧ涓庢湰鍦板寲妗嗘灦
### 浠诲姟鍐呭
- 鎸?v1.0.0 A 闃舵瑕佹眰锛屽畬鎴愬綋鍓嶆湭鎻愪氦鐨?`NOTE_READ_MODEL` 璇诲彇寮€鍏虫敹鍙ｃ€?- 琛ラ綈鍙戝竷鍓嶈鐩栫巼鍛戒护锛屾槑纭瘡涓噷绋嬬浠嶄互瀹屾暣 CI 涓虹‖闂ㄧ銆?- 鍏堝缓绔?`zh-CN` 婧愯瑷€涓?`en-US` 鍗犱綅瀛楀吀妗嗘灦锛屼笉鎶婂畬鏁磋嫳鏂囩炕璇戜綔涓?v1.0.0 闃诲椤广€?### 瀹屾垚缁撴灉
- 鍚庣绗旇鏈嶅姟鏀寔 `NOTE_READ_MODEL=mysql_primary|mongo_primary`锛宍mongo_primary` 浼樺厛璇诲彇 MongoDB `note_documents.html` 骞跺湪缂哄け鎴栧け璐ユ椂鍥為€€ MySQL銆?- 鏂板鏍硅剼鏈?`test:coverage` 鍙婄敤鎴风銆佺鐞嗙銆佸浘璋辨牳蹇冦€佸悗绔鐩栫巼瀛愬懡浠ゃ€?- 鏂板 `frontend-user/src/i18n/dictionary.ts` 鍜?`frontend-admin/src/i18n/dictionary.ts`锛屽苟娣诲姞瀛楀吀閿竴鑷存€ф祴璇曘€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 楠岃瘉缁撴灉
- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- B 闃舵鍙互鍦ㄥ凡鏈夎鐩栫巼鍜屽瓧鍏告鏋朵繚鎶や笅缁х画鎷嗗垎瓒呭ぇ鏂囦欢銆?- 鍙戝竷鍓嶉渶瑕侀澶栬繍琛?`npm run test:coverage` 骞惰褰曡鐩栫巼缂哄彛銆?## 2026-06-01 22:18:00 +08:00 | v0.0.74 | 鎷嗗垎 API client銆佸叏灞€鏍峰紡鍜屽浘璋卞伐浣滃尯 helper
### 浠诲姟鍐呭
- 鎸?B 闃舵瑕佹眰缁х画闄嶄綆瓒呭ぇ鏂囦欢缁存姢椋庨櫓銆?- 浼樺厛澶勭悊鐢ㄦ埛绔?API client銆佸叏灞€鏍峰紡鍜屽浘璋辨帶鍒跺櫒涓彲瀹夊叏鎶界鐨勭函 helper銆?### 瀹屾垚缁撴灉
- `frontend-user/src/api/client.ts` 鏀逛负绋冲畾 barrel锛屾帴鍙ｅ疄鐜版寜 auth銆乫iles銆乧ommunity銆乵aterials銆乶otes銆乺eader銆乬raphs銆乺eview銆乤i 鍩熸媶鍒嗐€?- `frontend-user/src/styles.css` 鏀逛负瀵煎叆鍏ュ彛锛屾牱寮忔寜 app銆亀orkspace銆乬raph銆乺eader-notes銆乻earch-review銆乺esponsive 鍒嗗眰銆?- `useGraphWorkspaceController.tsx` 鎶藉嚭鍥捐氨鏂囨。銆佸嚑浣曘€佹潵婧愬垎缁勩€佸鍑哄拰鐒︾偣瀵艰埅 helper 鍒?`frontend-user/src/modules/graph/lib/workspaceControllerHelpers.ts`銆?- 淇濈暀鐜版湁椤甸潰瀵煎叆璺緞鍜岃矾鐢辫涓恒€?### 楠岃瘉缁撴灉
- `npm run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- 鍥捐氨 hook 浠嶆壙杞藉ぇ閲忎氦浜掍笌 UI 缁勫悎锛孋 闃舵缁х画鎶?autosave銆乻election銆丄I draft 鍜岄潰鏉挎覆鏌撲笅娌夊埌鏇寸粏妯″潡銆?## 2026-06-01 22:32:00 +08:00 | v0.0.75 | 鏀跺彛 Reader/Notes 鏁版嵁鏉ユ簮涓庡浘璋辨€ц兘鍥炲綊
### 浠诲姟鍐呭
- 鎸?C 闃舵瑕佹眰琛ラ綈鍘嗗彶绗旇鍒?Mongo 鍐呭鏂囨。鐨勫洖濉矾寰勩€?- 涓?PDF 鎵规敞澧炲姞鍏煎鐨勫綊涓€鍖栧潗鏍囧瓧娈碉紝骞跺湪闃呰鍣?UI 涓樉绀鸿祫鏂欍€丳DF 椤靛拰鍧愭爣鐗囨鏉ユ簮銆?- 澧炲姞鍥捐氨澶ф暟鎹噺鍥炲綊鐢ㄤ緥銆?### 瀹屾垚缁撴灉
- 鏂板 `backend/cmd/backfill-note-documents`锛屾敮鎸佸箓绛?upsert 鍘嗗彶 `notes.content` 鍒?`note_documents`锛屽苟鏀寔 `-limit` 鍒嗘壒鎵ц銆?- `pdf_annotations` 鏂板 `rects` 瀛楁锛孌TO銆佹ā鍨嬨€佷粨鍌ㄧ紪鐮?瑙ｇ爜銆佹柊瑁呭簱杩佺Щ銆佸巻鍙插簱瀵归綈杩佺Щ鍜屽洖婊氳剼鏈悓姝ユ洿鏂般€?- Reader 鎵规敞鍒涘缓鏃跺啓鍏ュ熀纭€褰掍竴鍖栧潗鏍囷紝鎵规敞鍒楄〃灞曠ず璧勬枡鏍囬銆丳DF 椤靛拰鍧愭爣鐗囨鏁伴噺銆?- `@studymate/graph-core` 澧炲姞 200 鑺傜偣鎬ц兘澶瑰叿锛岃鐩?v1 鍥捐氨鏉ユ簮娉抽亾甯冨眬棰勭畻銆?### 楠岃瘉缁撴灉
- `cd backend; go test ./internal/modules/reader/... ./internal/modules/note/... ./cmd/backfill-note-documents` 閫氳繃銆?- `npm run typecheck` 閫氳繃銆?- `npm --workspace @studymate/graph-core run test` 閫氳繃銆?- `npm run ci` 閫氳繃锛岃鐩栫被鍨嬫鏌ャ€佹枃妗ｅ悓姝ャ€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?### 鍚庣画褰卞搷
- C 闃舵鍚庣画鍙户缁姞鍘氬浘璋辨不鐞嗛潰鏉夸笌 Undo/Redo/dirty 鐘舵€佺殑 UI 琛ㄨ揪銆?- D 闃舵鍙互澶嶇敤鎵规敞鏉ユ簮涓?AI draft 閾捐矾缁х画鎺ㄨ繘澶嶄範銆佹悳绱€佸悗鍙板拰鍒嗕韩銆?
## 2026-06-01 21:36:28 +08:00 | v0.0.72 | 鎷嗗垎鐢ㄦ埛绔富搴旂敤銆佸浘璋卞叆鍙ｅ拰绠＄悊绔叆鍙?### 浠诲姟鍐呭
- 鎸?v1.0 鍙戝竷鎺ㄨ繘椤哄簭锛屾墽琛岃秴澶ф枃浠舵媶鍒嗐€?- 鐩爣鏄厛瑙ｉ櫎 `frontend-user/src/app/App.tsx`銆乣frontend-user/src/modules/graph/GraphWorkspacePage.tsx`銆乣frontend-admin/src/App.vue` 涓変釜鍏ュ彛鏂囦欢鐨勫法鐭宠亴璐ｏ紝骞跺缓绔嬪悗缁户缁粏鎷嗙殑鐩綍杈圭晫銆?### 瀹屾垚缁撴灉
- 灏嗙敤鎴风涓诲簲鐢ㄦ媶鎴愶細
  - [frontend-user/src/app/routes.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/routes.tsx)
  - [frontend-user/src/app/shell/ShellFrame.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/shell/ShellFrame.tsx)
  - [frontend-user/src/pages/](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/pages/)
  - [frontend-user/src/features/ai/aiDrafts.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/features/ai/aiDrafts.ts)
- `frontend-user/src/app/App.tsx` 鏀逛负 1 琛屽吋瀹瑰鍑猴紝鍘熸湁璺敱鍜岄〉闈㈣涓轰繚鎸佷笉鍙樸€?- `frontend-user/src/modules/graph/GraphWorkspacePage.tsx` 鏀逛负钖勫３瀵煎嚭锛屽浘璋卞疄鐜扮Щ鍏?`components/GraphWorkspaceView.tsx` 鍜?`hooks/useGraphWorkspaceController.tsx`锛屽苟寤虹珛 `state/`銆乣lib/`銆乣exporters/`銆乣importers/` 杈圭晫銆?- `frontend-admin/src/App.vue` 鏀逛负钖勫３鎸傝浇 `views/AdminWorkspaceView.vue`锛屾柊澧?`router/index.ts`銆乣components/admin/AdminModuleBadge.vue` 鍜?`components/admin/admin.css`銆?- 绠＄悊绔牱寮忎粠鍗曟枃浠?Vue 鍐呰仈鏍峰紡杩佸嚭锛宍AdminWorkspaceView.vue` 闄嶅埌 500 琛屼互鍐呫€?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佽矾绾垮浘銆佺増鏈鍒掋€佸彉鏇磋褰曞拰椤圭洰鏃ュ織銆?### 楠岃瘉缁撴灉
- `npm run ci`
- CI 鑴氭湰鍐呴儴宸茶鐩栫被鍨嬫鏌ャ€佹枃妗ｆ牎楠屻€佸墠鍚庡彴鏋勫缓銆佺敤鎴风 Vitest銆佺鐞嗙 Vitest銆佸浘璋辨牳蹇冩祴璇曘€丳laywright E2E銆佸悗绔?`go test ./...`銆?### 鍚庣画褰卞搷
- 鍚庣画 reader/notes 涓?graph 鏀跺彛鏃讹紝搴旂户缁妸 `useGraphWorkspaceController` 鍐呴儴鐨勫ぇ鍨嬬姸鎬佷笌鎿嶄綔鎷嗗埌鏇寸粏 hooks/lib锛岃€屼笉鏄啀鎶婇€昏緫濉炲洖鍏ュ彛鏂囦欢銆?
## 2026-06-01 21:09:44 +08:00 | v0.0.71 | 寤虹珛 CI 涓庡墠绔祴璇曞熀绾?### 浠诲姟鍐呭
- 鎸?v1.0 鍙戝竷鎺ㄨ繘椤哄簭锛屽畬鎴愬伐绋嬪熀绾跨浜屾锛氭牴鑴氭湰銆佸墠鍚庡彴鍗曞厓娴嬭瘯銆丒2E 娴嬭瘯鍜?GitHub CI 瑕嗙洊銆?- 瑕佹眰淇濈暀鐜版湁 `go test ./...` 涓?`@studymate/graph-core` 娴嬭瘯锛屽苟鏂板鐢ㄦ埛绔?Vitest + React Testing Library銆佺鐞嗙 Vitest + Vue Test Utils銆丳laywright 绔埌绔祴璇曘€?### 瀹屾垚缁撴灉
- 鏇存柊 [package.json](/E:/Code/1108026_rust_go/StudyMate/package.json)锛屾柊澧?`lint`銆乣test:user`銆乣test:admin`銆乣test:e2e`銆乣verify:docs`銆乣ci`銆?- 鏇存柊鍓嶅悗鍙?package 鑴氭湰锛屽垎鍒帴鍏?Vitest 娴嬭瘯鍏ュ彛锛涚敤鎴风鏂板 `preview` 渚?Playwright 浣跨敤銆?- 鏂板 [frontend-user/vitest.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/vitest.config.ts)銆乕frontend-user/src/test/setup.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/test/setup.ts) 鍜屽浘璋辫妭鐐瑰瑙傛祴璇曘€?- 鏂板 [frontend-admin/vitest.config.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/vitest.config.ts)銆乕frontend-admin/src/test/setup.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/test/setup.ts) 鍜岀鐞嗙鐧诲綍椤?smoke 娴嬭瘯銆?- 鏂板 [playwright.config.ts](/E:/Code/1108026_rust_go/StudyMate/playwright.config.ts) 涓?[e2e/user-shell.spec.ts](/E:/Code/1108026_rust_go/StudyMate/e2e/user-shell.spec.ts)锛岃鐩栫敤鎴风鍏叡宸ヤ綔鍖哄姞杞姐€?- 鏇存柊 [.github/workflows/ci.yml](/E:/Code/1108026_rust_go/StudyMate/.github/workflows/ci.yml)锛孋I 瑕嗙洊 Node 24銆丟o 1.26銆乣npm ci`銆佺被鍨嬫鏌ャ€佸墠鍚庡彴鏋勫缓銆佸墠鍚庡彴娴嬭瘯銆丳laywright銆佸浘璋辨牳蹇冩祴璇曘€佸悗绔祴璇曞拰鏂囨。鍚屾銆?- 鍚屾鏇存柊 README銆佸紑鍙戣鏄庛€佽矾绾垮浘銆佺増鏈鍒掋€佸彉鏇磋褰曞拰鏂囨。鍚屾鑴氭湰銆?### 楠岃瘉缁撴灉
- `npm run ci`
- CI 鑴氭湰鍐呴儴宸茶鐩栵細
  - `npm run lint`
  - `npm run build:user`
  - `npm run build:admin`
  - `npm run test:user`
  - `npm run test:admin`
  - `npm --workspace @studymate/graph-core run test`
  - `npm run test:e2e`
  - `cd backend && go test ./...`
  - `npm run verify:docs`
### 鍚庣画褰卞搷
- 鍚庣画鎷嗗垎瓒呭ぇ鏂囦欢鍜屽浘璋卞姛鑳芥敹鍙ｆ椂锛屾湁鍓嶅悗鍙版渶灏忓洖褰掓祴璇曚笌 E2E 澹冲眰淇濇姢銆?- CI 宸插叿澶囧彂甯冨墠璐ㄩ噺闂ㄧ闆忓舰銆?
## 2026-06-01 21:00:51 +08:00 | v0.0.70 | 瀵归綈鏂囨。鏍戜笌 v1.0 鍙戝竷娌荤悊鍩虹嚎
### 浠诲姟鍐呭
- 鎸夌敤鎴疯姹傚厛淇伐绋嬪熀绾夸笌鏂囨。婕傜Щ锛屾妸褰撳墠 `master` 鎺ㄨ繘鍒板彲鍙戝竷 `v1.0.0` 鐨勬不鐞嗚建閬撱€?- 鍒涘缓鎴栫撼鍏?`docs/planning/ROADMAP.md`銆乣docs/planning/VERSION_PLAN.md`銆乣docs/planning/versions/v0.6.0-graph-product.md`銆乣docs/design/UPGRADE_DESIGN.md`銆乣CHANGELOG.md`銆乣.github/PULL_REQUEST_TEMPLATE.md`銆乣.github/workflows/ci.yml`銆乣scripts/verify-doc-sync.mjs`銆?- README 褰撳墠闃舵蹇呴』鍙嶆槧鐪熷疄鐘舵€侊細闃呰/绗旇宸查棴鐜紝鍥捐氨涓哄己 MVP锛屽涔犲拰 AI 閮ㄥ垎瀹炵幇锛屽悗鍙板鏍镐富閾惧瓨鍦ㄤ絾娌荤悊鑳藉姏涓嶅畬鏁淬€?### 瀹屾垚缁撴灉
- 鏇存柊 [.gitignore](/E:/Code/1108026_rust_go/StudyMate/.gitignore)锛岄噸鏂板厑璁?`PROJECT_LOG.md`銆乣docs/planning/` 鍜?`docs/design/` 杩涘叆鐗堟湰娌荤悊銆?- 閲嶅缓 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)锛屾妸涓诲鑸寚鍚?`docs/design/UPGRADE_DESIGN.md`锛屽苟淇濈暀鏍圭洰褰曡璁¤鏄庡吋瀹归摼鎺ャ€?- 閲嶅缓 [docs/planning/ROADMAP.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/ROADMAP.md) 鍜?[docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md)锛屾槑纭?A-E 鎵ц椤哄簭銆?.0 鑼冨洿鍙栬垗銆亃h-CN 婧愯瑷€/en-US 鍗犱綅绛栫暐鍜屽缓璁€ц兘棰勭畻銆?- 鏇存柊 [docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md)锛屾妸鍥捐氨瀹氫綅浠庤鍒掓敼涓哄己 MVP 鍚庣殑浜у搧鍖栨敹鍙ｃ€?- 澶嶅埗鏍圭洰褰?[瀛︿即椤圭洰-璁捐璇存槑涔?md](/E:/Code/1108026_rust_go/StudyMate/瀛︿即椤圭洰-璁捐璇存槑涔?md) 鍒?[docs/design/UPGRADE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/design/UPGRADE_DESIGN.md)銆?- 鏂板 [CHANGELOG.md](/E:/Code/1108026_rust_go/StudyMate/CHANGELOG.md)銆丳R 妯℃澘銆丆I 楠ㄦ灦鍜屾枃妗ｅ悓姝ユ牎楠岃剼鏈€?- 鏇存柊 [docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)锛岃ˉ鍏呮枃妗ｄ笌鐗堟湰娌荤悊娴佺▼銆?### 楠岃瘉缁撴灉
- `node scripts/verify-doc-sync.mjs`
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
- `cd backend; go test ./...`
### 鍚庣画褰卞搷
- 鍚庣画姣忎釜閲岀▼纰戦兘鏈夌粺涓€鏂囨。鍚屾娓呭崟銆丆I 鍏ュ彛鍜岄」鐩棩蹇楄褰曘€?- 涓嬩竴姝ヨ繘鍏?CI 涓庡墠绔祴璇曞熀绾垮缓璁俱€?
## 2026-06-01 20:05:00 +08:00 | v0.0.69 | 绉婚櫎鍥捐氨绂婚〉鏁撮〉鍒锋柊鍏滃簳浠ユ仮澶嶄晶杈规爮娴佺晠鍒囨崲
### 浠诲姟鍐呭
- 鐢ㄦ埛鍙嶉鍏朵粬椤甸潰涔嬮棿鍒囨崲娴佺晠锛屼絾浠庡浘璋卞垏鍒板埆鐨勯〉闈㈠儚鍒锋柊浜嗕竴娆°€?- 鍦?`v0.0.67` 宸茬粡淇绌烘煡璇㈠弬鏁拌Е鍙戝亣 AI 钀界偣寰幆鍚庯紝鏀跺洖姝ゅ墠涓哄厹搴曞姞鍦ㄥ浘璋辩椤典笂鐨?`reloadDocument`銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 绉婚櫎 `shouldHardLeaveGraph`
  - 绉婚櫎渚ц竟鏍忎富瀵艰埅鍜屽揩閫熷姩浣滀笂浠呴拡瀵?`/graph` 绂婚〉鐨?`reloadDocument`
  - 鍥捐氨绂诲紑鏃堕噸鏂拌蛋 React Router SPA 鍒囨崲锛屼笉鍐嶈〃鐜颁负娴忚鍣ㄧ骇鍒锋柊
- 淇濈暀鍥捐氨椤靛唴宸茬粡琛ュソ鐨勬牴鍥犱慨澶嶏細
  - 绌烘煡璇㈠弬鏁颁笉浼氳瑙ｆ瀽鎴愬亣 AI 棰勮钀界偣
  - AI 棰勮钀界偣娑堣垂鍚庝細娓呯悊 React Router state
  - 鍥捐氨鎷栨嫿寮傚父涓柇鏃朵細閲婃斁鍏ㄥ眬 pointer 鐘舵€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 鍚庣画褰卞搷
- 鍥捐氨椤电寮€浣撻獙鍥炲埌鍜屽叾浠栨ā鍧椾竴鑷寸殑鍗曢〉搴旂敤鍒囨崲銆?- 濡傛灉鍚庣画浠嶅嚭鐜板浘璋卞垏椤甸棶棰橈紝搴旂户缁慨鍏蜂綋杩愯鎬佹硠婕忥紝鑰屼笉鏄仮澶嶆暣椤靛埛鏂板厹搴曘€?
## 2026-06-01 18:06:00 +08:00 | v0.0.68 | 澧炲姞鍥捐氨鏉ユ簮鍏崇郴鎽樿浠ヨˉ榻愬唴瀹瑰埌鍥捐氨鐨勫彲瑙侀摼璺?### 浠诲姟鍐呭
- 缁х画鎸夌収 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 鎺ㄨ繘涓嬩竴姝ュ姛鑳藉疄鐜般€?- 褰撳墠闃舵閲嶇偣浠嶆槸鏀舵潫 `v0.4.0` 鍒?`v0.5.0` 鐨勪氦鐣岋細璁╄祫鏂欍€佹壒娉ㄣ€佺瑪璁板埌鍥捐氨鑺傜偣鐨勬潵婧愬叧绯绘竻鏅板彲瑙併€?### 瀹屾垚缁撴灉
- 鏇存柊 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)锛?  - 鏂板 `summarizeGraphSourceReferences`
  - 瀵瑰浘璋辫妭鐐逛腑鐨?`source` 鍋氬幓閲嶆眹鎬伙紝杈撳嚭鎬绘潵婧愭暟銆佸甫鏉ユ簮鑺傜偣鏁般€佹寜鏉ユ簮绫诲瀷鑱氬悎鍜屾潵婧愭槑缁?  - 鏉ユ簮绫诲瀷鎸夎祫鏂欍€佹壒娉ㄣ€佺瑪璁般€佸崱鐗囥€丄I 鑽夌绛夌ǔ瀹氶『搴忚緭鍑?- 鏇存柊 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)锛?  - 鏂板鏉ユ簮鍏崇郴鎽樿娴嬭瘯锛岃鐩栧悓涓€鏉ユ簮琚涓妭鐐瑰紩鐢ㄦ椂鐨勫幓閲嶅拰鑺傜偣璁℃暟
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鍥捐氨鍙充晶鏍忔柊澧炩€滄潵婧愬叧绯?/ 鍥捐氨寮曠敤鈥濆尯鍧?  - 灞曠ず鏉ユ簮瀵硅薄鏁般€佸甫鏉ユ簮鑺傜偣鏁般€佹潵婧愮被鍨嬫憳瑕佸拰鍓?5 涓潵婧愭槑缁?  - 娌℃湁鏉ユ簮鏃舵樉绀虹┖鎬侊紝鎻愮ず鐢ㄦ埛浠庤祫鏂欍€佺瑪璁版垨鎵规敞鐢熸垚鑺傜偣鍚庝細鐪嬪埌鍏崇郴
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 鍜?[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)锛岃ˉ榻愭潵婧愬叧绯诲垪琛ㄦ牱寮忓拰褰撳墠鑳藉姏璇存槑銆?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 鍚庣画褰卞搷
- 鍥捐氨涓嶅啀鍙槸鈥滆妭鐐圭敾甯冣€濓紝鐢ㄦ埛鍙互鐩存帴鐪嬭杩欏紶鍥捐氨鍜岃祫鏂欍€佹壒娉ㄣ€佺瑪璁般€佸崱鐗囦箣闂寸殑鏉ユ簮鍏崇郴銆?- 鍚庣画濡傛灉瑕佹妸 `graph_relations` 鏆撮湶涓哄悗绔?API 鎴栨帴鍏ユ悳绱?杩愯惀鍚庡彴锛屽彲浠ュ鐢ㄥ綋鍓嶆憳瑕佺粨鏋勪綔涓哄墠绔睍绀烘ā鍨嬨€?
## 2026-06-01 18:00:00 +08:00 | v0.0.67 | 淇绌烘煡璇㈠弬鏁拌Е鍙戝亣 AI 钀界偣寰幆骞朵负鍥捐氨绂婚〉鍔犳祻瑙堝櫒绾у厹搴?### 浠诲姟鍐呭
- 鐢ㄦ埛鍙嶉鍓嶄袱杞竻鐞嗗悗渚濈劧鏃犳硶鐐瑰嚮渚ц竟鏍忓垏鎹紝瑕佹眰鑷鏌ユ壘銆佹祴璇曞苟瑙ｅ喅锛屽繀瑕佹椂鍥為€€鎴栭噸鍋氬浘璋卞姛鑳斤紝鏈€缁堝繀椤诲緱鍒板彲姝ｅ父鍒囨崲鐨勭増鏈€?- 缁х画杩芥煡 AI 棰勮钀界偣閫昏緫鏈韩鏄惁鍦ㄦ病鏈変换浣?focus 鏌ヨ鍙傛暟鏃朵粛琚Е鍙戙€?### 瀹屾垚缁撴灉
- 鎵惧埌鍏抽敭鏍瑰洜锛氭棫閫昏緫鐩存帴鎵ц `Number(focusSearch.get("focusX"))` 绛夎В鏋愩€傜敱浜?`Number(null) === 0`锛屾病鏈変换浣?`focusX / focusY / focusWidth / focusHeight` 鍙傛暟鏃朵篃浼氱敓鎴愪竴涓?`{ x: 0, y: 0, width: 0, height: 0 }` 鐨勫亣 AI 棰勮钀界偣锛屽鑷村浘璋遍〉鍦ㄦ櫘閫?`/graph` 璺敱涓婁篃鍙嶅杩涘叆棰勮钀界偣鐘舵€佹洿鏂伴摼銆?- 鏇存柊 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)锛?  - 鏂板 `parseGraphFocusPreviewSearch`
  - 鍙湁瀹屾暣瀛樺湪 `focusX / focusY / focusWidth / focusHeight`锛屼笖瀹介珮澶т簬 0 鏃舵墠杩斿洖鏈夋晥棰勮钀界偣
  - 绌哄弬鏁般€佺己鍙傛暟銆侀浂灏哄鍙傛暟鍏ㄩ儴杩斿洖 `null`
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛屾敼涓轰娇鐢ㄥ畨鍏ㄨВ鏋愬嚱鏁帮紝涓嶅啀璁╂櫘閫氬浘璋遍〉璇Е鍙戦璁¤惤鐐广€?- 鏇存柊 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)锛屾柊澧炵┖鏌ヨ銆佺己瀛楁銆侀浂灏哄鍜屾湁鏁堟煡璇㈢殑鍥炲綊娴嬭瘯銆?- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛屽鍔犲浘璋辩椤靛厹搴曪細
  - 褰撳墠璺緞鍦?`/graph` 鏃讹紝渚ц竟鏍忎富瀵艰埅鍜屽揩閫熷姩浣滅寮€鍥捐氨浼氫娇鐢?`reloadDocument`
  - 杩欑浉褰撲簬鍙湪绂诲紑澶嶆潅鐢诲竷椤垫椂鍚敤娴忚鍣ㄧ骇鍒囨崲淇濋櫓锛岀‘淇濇渶缁堜竴瀹氳兘浠庡浘璋卞垏鍒板叾浠栨ā鍧?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 鍚庣画褰卞搷
- 棰勮钀界偣涓嶅啀鍥犱负绌烘煡璇㈠弬鏁板舰鎴愬亣鐘舵€佸惊鐜紝杩欐槸杩欐鏃犳硶鍒囨崲闂鐨勫疄璐ㄤ慨澶嶃€?- 鍗充娇鍚庣画鍥捐氨椤靛張寮曞叆鏂扮殑澶嶆潅杩愯鎬侊紝绂诲紑鍥捐氨涔熸湁娴忚鍣ㄧ骇鍏滃簳锛屼笉鍐嶆妸鐢ㄦ埛閿佸湪鍥捐氨椤甸噷銆?
## 2026-06-01 17:52:00 +08:00 | v0.0.66 | 褰诲簳娓呯悊 React Router 涓殑 AI 棰勮钀界偣鐘舵€佸苟鍔犲浐鍥捐氨鎷栨嫿閲婃斁
### 浠诲姟鍐呭
- 鐢ㄦ埛鍙嶉娓呯悊娴忚鍣?history 鍚庝粛鏃犳硶鐐瑰嚮渚ц竟鏍忓垏鎹紝璇存槑鍙敼 `window.history.replaceState` 娌℃湁鍚屾娓呮帀 React Router 鍐呭瓨涓殑 `location.state`銆?- 缁х画鎺掓煡鍥捐氨杩愯鎬佹槸鍚﹁繕鏈夊叏灞€ pointer 鎷栨嫿鐘舵€佹畫鐣欙紝瀵艰嚧渚ц竟鏍忕偣鍑昏椤甸潰杩愯鎬佹寔缁共鎵般€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 灏?AI 棰勮钀界偣娑堣垂鍚庣殑娓呯悊鏂瑰紡浠庣洿鎺ュ啓 `window.history.replaceState` 鏀逛负 React Router `navigate(..., { replace: true, state: null })`
  - 杩欐牱娴忚鍣ㄥ湴鍧€鍜?React Router 鍐呭瓨閲岀殑 `location.state` 浼氫竴璧锋竻鎺夛紝涓嶅啀鍙竻涓€鍗?  - 淇濈暀瀵规棫鐗?`focus*` 鏌ヨ鍙傛暟鐨勫悓姝ュ垹闄?  - 涓哄浘璋辨嫋鎷藉叏灞€鐩戝惉琛ュ厖 `pointercancel`銆乣blur` 鍜?`event.buttons` 闃叉紡淇濇姢锛岄伩鍏嶇獥鍙ｅ鏉炬墜鍚庢嫋鎷芥€佷竴鐩存寕鐫€
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛屾彁楂樹晶杈规爮灞傜骇锛岄伩鍏嶅浘璋卞伐浣滃尯浠讳綍婧㈠嚭灞傛姠渚ц竟鏍忕偣鍑汇€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 鍚庣画褰卞搷
- AI 棰勮钀界偣鐜板湪浼氳 React Router 鐪熸娑堣垂骞剁Щ闄わ紝涓嶄細缁х画鐣欏湪褰撳墠璺敱瀵硅薄閲屻€?- 鍗充娇鍥捐氨鎷栨嫿杩囩▼寮傚父涓柇锛岄〉闈篃浼氳嚜鍔ㄩ噴鏀惧叏灞€鎷栨嫿鐩戝惉锛屼晶杈规爮鍒囨崲涓嶅簲鍐嶈鍥捐氨杩愯鎬佹嫋浣忋€?
## 2026-06-01 17:41:00 +08:00 | v0.0.65 | 娓呯悊 AI 棰勮钀界偣鐨勬祻瑙堝櫒鍘嗗彶鐘舵€佷互瑙ｉ櫎渚ц竟鏍忓垏鎹㈠崰鐢?### 浠诲姟鍐呭
- 鏍规嵁鐢ㄦ埛鍙嶉缁х画杩芥煡鈥淎I 棰勮钀界偣涓€鐩村崰鐢ㄦ祻瑙堝櫒杩愯鐘舵€侊紝瀵艰嚧鏃犳硶鍒囨崲渚ц竟鏍忊€濈殑闂銆?- 閲嶇偣妫€鏌ュ浘璋遍〉娑堣垂 `location.state` 鍜屾棫鏌ヨ鍙傛暟鍚庯紝鏄惁浠嶆妸棰勮钀界偣涓婁笅鏂囩暀鍦ㄥ綋鍓嶆祻瑙堝櫒鍘嗗彶璁板綍閲屻€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板 `clearFocusNavigationFromBrowserHistory`
  - 鍥捐氨椤靛湪娑堣垂 AI 棰勮钀界偣鍚庯紝浼氱珛鍗虫竻鐞嗗綋鍓?history entry 涓?React Router 淇濆瓨鐨?`usr` state
  - 鍚屾椂娓呯悊鏃х増 URL 娣遍摼閲岀殑 `graphId / focusX / focusY / focusWidth / focusHeight / focusLabel` 鏌ヨ鍙傛暟
  - 娓呯悊杩囩▼浣跨敤 `window.history.replaceState`锛屼笉鍐嶈Е鍙戜竴娆￠澶栫殑 React Router 瀵艰埅锛岄伩鍏嶉噸鏂板紩鍏ュ垏椤电珵浜?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm --workspace @studymate/graph-core run test`
### 鍚庣画褰卞搷
- AI 棰勮钀界偣鐜板湪鐪熸鍙樻垚涓€娆℃€ц緭鍏ワ細杩涘叆鍥捐氨鍚庡彧璐熻矗涓存椂瀹氫綅鍜岄珮浜紝涓嶅啀闀挎湡鎸傚湪娴忚鍣ㄥ巻鍙茬姸鎬佷笂銆?- 渚ц竟鏍忓垏鎹笉鍐嶈涓婁竴鏉￠璁¤惤鐐?state 鐗典綇锛涘鏋滃悗缁繕鏈夋畫鐣欙紝搴旂户缁煡椤甸潰鍗歌浇杈圭晫鎴栧叏灞€ pointer/keydown 鐩戝惉锛岃€屼笉鏄璁¤惤鐐硅矾鐢辩姸鎬併€?
## 2026-06-01 17:25:00 +08:00 | v0.0.64 | 琛ラ綈鍥捐氨澶氶€夋潵婧愭吵閬撳竷灞€骞朵慨澶嶆壒閲忔暣鐞嗘枃妗堜贡鐮?### 浠诲姟鍐呭
- 缁х画鎸夌収 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 鎺ㄨ繘鍥捐氨鐩稿叧鑳藉姏锛屼紭鍏堣ˉ寮?`v0.6.0` 鍥捐氨浜у搧鍖栭噷鐨勯暱鏈熸暣鐞嗕綋楠屻€?- 鍦ㄥ凡鏈夆€滄寜鏉ユ簮鍒嗚 / 鍒嗗垪 / 鐢熸垚鏉ユ簮鍒嗙粍鈥濈殑鍩虹涓婏紝琛ヤ竴涓洿閫傚悎 20+ 鑺傜偣鍥捐氨鏁寸悊鐨勬潵婧愭吵閬撳竷灞€銆?### 瀹屾垚缁撴灉
- 鏇存柊 [packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)锛屾柊澧?`buildSourceSwimlaneLayout`锛?  - 鎸夎祫鏂欍€佹壒娉ㄣ€佺瑪璁般€佸崱鐗囥€丄I銆佽嚜鐢辫妭鐐圭殑绋冲畾椤哄簭鐢熸垚鏉ユ簮娉抽亾
  - 杩斿洖鏂扮殑鑺傜偣浣嶇疆鍜屽甫 `metadata.layoutKind = source-swimlane` 鐨勫垎缁勶紝涓嶄慨鏀瑰師濮嬭妭鐐规暟缁?  - 瀵硅妭鐐逛綅缃仛鐢诲竷杈圭晫绾︽潫锛岄伩鍏嶇敓鎴愬悗璺戝嚭鍙敤宸ヤ綔鍖?- 鏂板 [packages/graph-core/test/sourceSwimlaneLayout.test.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/test/sourceSwimlaneLayout.test.ts)锛岃鐩栨潵婧愭吵閬撻『搴忋€佸垎缁勫厓鏁版嵁銆佷笉鍙彉鎬у拰杈圭晫绾︽潫銆?- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 澶氶€夎妭鐐圭殑鈥滄寜鏉ユ簮鏁寸悊鈥濋潰鏉挎柊澧炩€滅敓鎴愭潵婧愭吵閬撯€?  - 鐢熸垚娉抽亾鏃朵細鏇挎崲鍚屼竴鎵硅妭鐐逛笂鏃х殑鑷姩鏉ユ簮娉抽亾锛岄伩鍏嶉噸澶嶅爢鍙?  - 淇鎵归噺瀵归綈銆佸眳涓拰鍧囧垎鎸夐挳鐨勪贡鐮佷腑鏂囨枃妗?- 鏇存柊 [backend/internal/modules/graph/dto/graph.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/dto/graph.go) 鍜?[frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)锛屼负鍥捐氨鍒嗙粍琛ュ厖鍙€?`metadata` 瀛楁锛岀敤浜庢爣璁拌嚜鍔ㄧ敓鎴愮殑鏉ユ簮娉抽亾銆?- 鏇存柊 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md) 涓?[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)锛屽悓姝ュ浘璋卞垎缁勫厓鏁版嵁鍜屽綋鍓嶆湰鍦拌兘鍔涜鏄庛€?### 楠岃瘉缁撴灉
- `npm --workspace @studymate/graph-core run test`
- `npm run typecheck`
- `npm run build:user`
- `cd backend; go test ./...`
### 鍚庣画褰卞搷
- 鍥捐氨澶氶€夋暣鐞嗙幇鍦ㄥ彲浠ヤ粠鈥滄暎鐐规暣鐞嗏€濈洿鎺ユ彁鍗囧埌鈥滄寜鏉ユ簮娉抽亾褰掓。鈥濓紝鏇磋创杩戦暱鏈熷涔犵煡璇嗗簱鐨勬暣鐞嗗満鏅€?- 鍚庣画鍙互缁х画鎶婃潵婧愭吵閬撴墿灞曚负鍙姌鍙犳ā鏉裤€佹吵閬撻噸鎺掞紝鎴栨妸 AI 鑽夌纭鍚庣殑钀藉浘娴佺▼鐩存帴鎺ュ叆杩欏甯冨眬绠楁硶銆?
## 2026-06-01 18:05:00 +08:00 | v0.0.63 | 灏嗗浘璋?AI 棰勮钀界偣浠庡浘璋辨枃妗ｅ啓鍏ユ敼涓虹函棰勮瑙嗗彛鏇存柊
### 浠诲姟鍐呭
- 鏍规嵁澶嶇幇绾跨储缁х画缂╁皬闂鑼冨洿锛氬彧鏈夊湪鈥滃畾浣嶅埌 AI 棰勮钀界偣鈥濅箣鍚庢墠浼氬嚭鐜拌矾鐢?URL 宸插彉鍖栦絾椤甸潰浠嶅仠鍦ㄥ浘璋辩殑鐜拌薄銆?- 閲嶇偣鎺掓煡 AI 棰勮钀界偣鏄惁閿欒鍦拌蛋杩涗簡鍥捐氨鏂囨。鐨勬寮忓彉鏇撮摼璺紝瀵艰嚧 dirty銆佽嚜鍔ㄤ繚瀛樻垨鍘嗗彶鐘舵€佸共鎵板悗缁垏椤点€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板 `GraphFocusNavigationState`锛岀户缁敮鎸佷粠 `location.state` 璇诲彇 AI 棰勮钀界偣鍜岀洰鏍囧浘璋?  - 寮曞叆 `consumedFocusRef` 鍜?`requestedFocusKey`锛屼繚璇佸悓涓€浠?AI 棰勮钀界偣鍙秷璐逛竴娆?  - 灏嗗師鏉ョ殑 `focusPreviewArea` 鏀逛负 `buildFocusPreviewViewport`锛屽彧璁＄畻棰勮瑙嗗彛
  - 鏂板 `previewViewport`锛屼粎鏇存柊褰撳墠鍥捐氨椤甸潰鐨勮鍙ｅ睍绀猴紝涓嶅啀閫氳繃 `mutateDocument` 鎶?AI 棰勮钀界偣鍐欐垚鍥捐氨鏂囨。鏇存敼
  - 鍒犻櫎 AI 棰勮钀界偣缁撴潫鍚庣殑璺敱鍥炲啓閫昏緫锛岄瑙堢粨鏉熷彧鍏抽棴楂樹寒锛屼笉鍐嶈Е鍙?`navigate`
- 杩欐剰鍛崇潃 AI 棰勮钀界偣鐜板湪鏄€滀复鏃惰鍙ｉ瑙堚€濓紝涓嶄細鍐嶆妸鍥捐氨鎷栬繘 dirty銆佽嚜鍔ㄤ繚瀛樺拰鍘嗗彶鍫嗘爤閾捐矾銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鍥捐氨椤靛湪 AI 棰勮钀界偣鍚庝笉鍐嶄骇鐢熸棤鎰忎箟鐨勬枃妗ｄ慨鏀癸紝鍚庣画濡傛灉浠嶆湁鍒囬〉闂锛屽氨鍙互鏇存槑纭湴缁х画杩藉悜椤甸潰杩愯鎬佹垨 React Router 娓叉煋閾撅紝鑰屼笉鏄浘璋辨暟鎹啓鍏ラ摼銆?- 杩欎篃璁?AI 棰勮钀界偣鐨勮涔夋洿骞插噣锛氬畠鍙槸甯姪鐢ㄦ埛鐪嬭鈥滀細钀藉湪鍝噷鈥濓紝涓嶆槸鍋峰伔鏀瑰姩鍥捐氨鏈韩銆?
## 2026-06-01 17:32:00 +08:00 | v0.0.62 | 灏嗗伐浣滃尯宓屽璺敱鏀逛负鐩稿璺緞骞跺 Outlet 鍋氳矾寰勭骇閲嶆寕杞?### 浠诲姟鍐呭
- 鍦?`v0.0.61` 鐨勫祵濂楄矾鐢遍噸鏋勫悗锛岀户缁敹绱ц矾鐢辫竟鐣岋紝鎺掗櫎 React Router 涓粷瀵瑰瓙璺敱閰嶇疆鍜屽瓙椤甸潰澶嶇敤杈圭晫涓嶆竻瀵艰嚧鍥捐氨椤垫畫鐣欑殑鍙兘鎬с€?- 鍦ㄤ笉閫€鍥炴暣椤甸噸杞界殑鍓嶆彁涓嬶紝璁╀富宸ヤ綔鍖哄湪璺緞鍒囨崲鏃舵洿鏄庣‘鍦板嵏杞芥棫椤甸潰銆佹寕杞芥柊椤甸潰銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 灏嗗叕鍏卞伐浣滃尯涓庡彈淇濇姢宸ヤ綔鍖虹殑瀛愯矾鐢变粠缁濆璺緞鏀逛负鐩稿璺緞
  - 灏嗛椤垫敼涓?`index` 璺敱锛屽叾浠栨ā鍧楅〉缁熶竴鏀朵负鏍囧噯鐨勫祵濂楄矾鐢卞啓娉?  - 鍦?`PublicShellRoute` 鍜?`ProtectedShellRoute` 涓紝涓?`Outlet` 澧炲姞 `key={location.pathname}`锛屾妸璺緞鍙樺寲鏃剁殑椤甸潰閲嶅缓杈圭晫鏀舵暃鍒扮湡姝ｇ殑瀛愰〉闈㈠眰
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪鍗充娇澶栧眰澹冲眰淇濇寔绋冲畾锛岀湡姝ｇ殑椤甸潰鍐呭涔熶細鎸夎矾寰勬樉寮忛噸鎸傝浇锛屽浘璋遍〉濡傛灉杩樻湁娈嬬暀鍓綔鐢紝浼氭洿瀹规槗琚檺瀹氬湪椤甸潰瀛愭爲鑰屼笉鏄墿鏁ｅ埌鏁翠釜宸ヤ綔鍖恒€?- 濡傛灉杩欎竴杞悗渚濈劧澶嶇幇锛屽氨搴旂户缁妸鎺掓煡閲嶇偣杞悜 `GraphWorkspacePage` 鑷韩鐨勮繍琛屾€佽娴嬶紝渚嬪鍔犺浇娴佺▼銆佽嚜鍔ㄤ繚瀛樸€佸叏灞€浜嬩欢鐩戝惉涓?AI 棰勮钀界偣楂樹寒鐨勭敓鍛藉懆鏈熻竟鐣屻€?
## 2026-06-01 17:18:00 +08:00 | v0.0.61 | 灏嗗墠绔富宸ヤ綔鍖鸿矾鐢遍噸鏋勪负宓屽璺敱骞舵挙鍥炲浘璋卞垏椤电殑鏁撮〉閲嶈浇鍏滃簳
### 浠诲姟鍐呭
- 缁х画杩芥煡鈥滀粠 AI 棰勮钀界偣杩涘叆鍥捐氨鍚庯紝鍒囨崲鍒扮瑪璁扮瓑妯″潡鏃?URL 宸插彉鍖栦絾椤甸潰浠嶅仠鍦ㄥ浘璋扁€濈殑鏍瑰洜锛屼笉婊¤冻浜庨暱鏈熶緷璧?`reloadDocument` 鐨勬暣椤靛埛鏂扮粫杩囥€?- 閲嶇偣妫€鏌?`App.tsx` 涓噸澶嶅寘瑁?`ShellFrame` 鐨勮矾鐢辩粨鏋勬槸鍚﹀鑷村浘璋遍〉娈嬬暀杩愯鎬佹洿闅捐姝ｅ父鍗歌浇锛屽悓鏃朵繚鐣欏凡缁忎慨杩囩殑 AI 钀界偣涓€娆℃€у鑸姸鎬侀€昏緫銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 鏂板 `PublicShellRoute` 鍜?`ProtectedShellRoute`锛岀敤 `Outlet` 缁熶竴鎵胯浇宸ヤ綔鍖洪〉闈?  - 灏嗛椤点€佽祫鏂欏簱銆佺ぞ鍖恒€佹悳绱㈤〉鏀惰繘鍏叡澹冲眰璺敱
  - 灏嗛槄璇诲櫒銆佺瑪璁般€佸浘璋便€佸涔犮€丄I銆佽缃〉鏀惰繘鍙椾繚鎶ゅ３灞傝矾鐢?  - 绉婚櫎宸︿晶涓诲鑸拰蹇€熷姩浣滀笂鐨?`reloadDocument`锛屾仮澶嶄负姝ｅ父 SPA 鍒囨崲
  - 绉婚櫎涔嬪墠涓哄己鍒跺埛鏂伴〉闈㈣€屽姞涓婄殑璺緞绾т富宸ヤ綔鍖洪噸鎸傝浇鍏滃簳锛岃璺敱鐢熷懡鍛ㄦ湡閲嶆柊鍥炲埌鏇磋嚜鐒剁殑缁撴瀯杈圭晫涓?- 淇濈暀姝ゅ墠 AI 宸ヤ綔鍙板埌鍥捐氨椤电殑 `Link state` 浼犻€掓柟寮忥紝浠ュ強鍥捐氨椤靛彧娑堣垂涓€娆￠璁¤惤鐐圭殑瀹炵幇锛岄伩鍏嶆妸闂閲嶆柊甯﹀洖鏌ヨ鍙傛暟鍜岃矾鐢卞洖鍐欓摼璺噷銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 涓诲伐浣滃尯鐜板湪鍥炲埌鏍囧噯鐨勫崟椤靛簲鐢ㄨ矾鐢卞垏鎹㈠舰鎬侊紝鍥捐氨椤电寮€鏃剁殑鍗歌浇杈圭晫鏇存竻鏅帮紝鍚庣画缁х画鎺掓煡杩愯鎬佹畫鐣欐椂涔熸洿瀹规槗缂╁皬鍒板崟涓〉闈㈠壇浣滅敤锛岃€屼笉鏄暣濂楀澹崇粨鏋勩€?- 濡傛灉杩欐缁撴瀯鏀跺彛鍚庝粛鑳藉鐜板浘璋卞崱浣忓垏椤碉紝涓嬩竴姝ュ氨搴旂户缁 `GraphWorkspacePage` 鍋氳繍琛屾€佺骇鎺掓煡锛屼緥濡備负鍏抽敭鍓綔鐢ㄥ拰鍏ㄥ眬鐩戝惉澧炲姞鏇寸粏鐨勬秷璐?娓呯悊瑙傛祴锛岃€屼笉鏄啀鍥炲埌鏁撮〉閲嶈浇鏂规銆?
## 2026-06-01 16:48:00 +08:00 | v0.0.60 | 灏?AI 鍒板浘璋辩殑棰勮钀界偣浼犻€掍粠 URL 鏌ヨ鍙傛暟鍒囨崲涓轰竴娆℃€у鑸姸鎬?### 浠诲姟鍐呭
- 缁х画娌跨潃鈥滃浘璋遍〉 AI 鐩稿叧瀹炵幇鏄惁鏈韩鏈夐棶棰樷€濈殑鏂瑰悜鏀舵潫锛屾妸棰勮钀界偣杩欐潯閾句粠鍦板潃鏍忓弬鏁伴┍鍔ㄦ敼鎴愭洿閫傚悎涓€娆℃€ч瑙堢殑瀵艰埅鐘舵€併€?- 鐩爣鏄笉鍐嶈 AI 棰勮鎶婁富璺敱璇箟鍜屽浘璋卞唴閮ㄤ复鏃剁姸鎬佺粦鍦ㄤ竴璧枫€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 璋冩暣 AI 宸ヤ綔鍙伴噷鐨勨€滃幓鐩爣鍥捐氨鏌ョ湅钀界偣鈥濆叆鍙?  - 涓嶅啀鏋勯€?`/graph?graphId=...&focusX=...` 杩欑被鏌ヨ鍙傛暟閾炬帴
  - 鏀逛负閫氳繃 `Link state` 浼犻€?`graphId` 鍜?`focusPreview`
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板鍥捐氨棰勮瀵艰埅鐘舵€佺被鍨?  - 浼樺厛浠?`location.state` 璇诲彇 `graphId` 鍜?`focusPreview`
  - 涓?state 椹卞姩鐨勯瑙堣姹傜敓鎴愮嫭绔嬫秷璐?key锛岄伩鍏嶉噸澶嶈Е鍙?  - 淇濈暀瀵规棫鏌ヨ鍙傛暟褰㈠紡鐨勫吋瀹硅鍙栵紝閬垮厤鐜版湁閾炬帴澶辨晥
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- AI 棰勮钀界偣鐜板湪鏇村儚涓€娆℃€х殑鈥滆烦杞笂涓嬫枃鈥濓紝涓嶄細鍐嶉暱鏈熸寕鍦ㄥ湴鍧€鏍忎笂锛屼篃鏇翠笉瀹规槗鍜屽浘璋遍〉鑷繁鐨勮矾鐢卞鐞嗙浉浜掑共鎵般€?- 鍚庣画濡傛灉瑕佺户缁ˉ AI 鍚堝苟寤鸿銆佸浘璋卞啿绐佸鏌ユ垨钀界偣纭娴侊紝鍙互鐩存帴娌跨潃杩欏 `location.state` 杈撳叆妯″瀷鎵╁睍锛岃€屼笉蹇呯户缁墿寮?URL 璇箟銆?
## 2026-06-01 16:32:00 +08:00 | v0.0.59 | 灏嗕富瀵艰埅鍒囨崲涓烘枃妗ｇ骇璺宠浆浠ュ交搴曡閬垮浘璋遍〉娈嬬暀杩愯鎬佸崱浣忓垏椤?### 浠诲姟鍐呭
- 鍦ㄥ浘璋遍〉 AI 钀界偣棰勮鐩稿叧鍓綔鐢ㄦ敹缂╁悗锛岀敤鎴蜂粛鍙嶉鈥滅偣鍑诲叾浠栭〉闈?URL 浼氬彉鍖栵紝浣嗛〉闈粛鍗″湪鍥捐氨锛屽彧鏈夊埛鏂版墠浼氳烦杞繃鍘烩€濄€?- 鍏堟彁渚涗竴灞傜ǔ瀹氬彲鐢ㄧ殑浜や簰鍏滃簳锛岃涓绘ā鍧楀垏鎹笉鍐嶄緷璧栧綋鍓嶅崟椤佃繍琛屾€佹槸鍚﹀畬鍏ㄥ仴搴枫€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 涓哄乏渚т富瀵艰埅鐨?`NavLink` 澧炲姞 `reloadDocument`
  - 涓烘湭鐧诲綍鎬侀攣瀹氬鑸殑 `Link` 澧炲姞 `reloadDocument`
  - 涓轰晶鏍忓揩閫熷姩浣滃叆鍙ｅ鍔?`reloadDocument`
  - 璁╀粠鍥捐氨鍒囧埌绗旇銆佽祫鏂欏簱銆佺ぞ鍖恒€丄I 绛変富妯″潡鏃剁洿鎺ユ寜鐩爣 URL 閲嶆柊杩涘叆椤甸潰锛屼笉鍐嶈鏃х殑鍓嶇杩愯鎬佸崱浣?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪涓诲鑸垏鎹細琛ㄧ幇寰楁洿鍍忊€滃伐浣滃彴妯″潡璺宠浆鈥濊€屼笉鏄畬鍏ㄤ緷璧栧崟椤靛唴鍒囨崲锛屽褰撳墠杩欑被鍥捐氨杩愯鎬佹畫鐣欓棶棰樻湁鐩存帴鍏滃簳鏁堟灉銆?- 杩欎竴姝ュ厛淇濊瘉鍙敤鎬э紱鍚庣画浠嶅€煎緱缁х画杩芥牴鍥狅紝鎶婂浘璋遍〉杩愯鎬佹竻鐞嗗仛鍥炵湡姝ｇǔ瀹氱殑 SPA 鍒囨崲銆?
## 2026-06-01 16:18:00 +08:00 | v0.0.58 | 鍘绘帀鍥捐氨 AI 钀界偣棰勮瀵硅矾鐢辩殑鍏ㄩ儴鍐欐搷浣?### 浠诲姟鍐呭
- 鍦ㄤ笂涓€杞粛鏈畬鍏ㄨВ闄も€淎I 钀界偣棰勮鍚庡垏鍒扮瑪璁颁粛鍗″湪鍥捐氨鈥濈殑鎯呭喌涓嬶紝缁х画鎶婇棶棰樻敹缂╁埌鍥捐氨椤佃嚜韬殑璺敱鍓綔鐢ㄤ笂銆?- 鐩爣鏄鍥捐氨椤垫妸 AI 棰勮钀界偣鍙綋浣滀竴娆℃€ц緭鍏ユ秷璐癸紝涓嶅啀鍦ㄩ瑙堟湡闂翠富鍔ㄤ慨鏀逛换浣曡矾鐢辩姸鎬併€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板 `consumedFocusRef`锛屾寜褰撳墠 `location.search` 璁板綍宸叉秷璐硅繃鐨勮惤鐐归瑙堣姹?  - AI 钀界偣棰勮鍙湪鍚屼竴浠芥煡璇㈠弬鏁伴娆¤繘鍏ユ椂瑙﹀彂涓€娆★紝閬垮厤閲嶅瀹氫綅
  - 瀹屽叏绉婚櫎鍥捐氨椤靛湪棰勮鏈熼棿瀵硅矾鐢辩殑 `navigate` 鍐欐搷浣?  - 璁℃椂鍣ㄥ彧璐熻矗鍏抽棴鏈湴楂樹寒锛屼笉鍐嶆竻 URL锛屼篃涓嶅啀鏇挎崲褰撳墠璺緞
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪鍥捐氨椤靛嵆浣夸粠 `/ai` 甯︾潃钀界偣鍙傛暟杩涘叆锛屼篃涓嶄細鍐嶅湪棰勮缁撴潫鏃跺洖鍐欒矾鐢憋紝鍥犳涓嶄細鍜岀敤鎴蜂富鍔ㄥ垏鎹㈠埌 `/notes`銆乣/materials` 绛夎矾寰勪骇鐢熺珵浜夈€?- 杩欎細璁?AI 钀界偣棰勮鏇村儚鏅€氱殑鈥滃垵濮嬪畾浣嶈緭鍏モ€濓紝鍚庣画濡傛灉瑕佸仛鏇村鏉傜殑鍥捐氨娣遍摼锛屼篃鑳藉湪涓嶅共鎵颁富璺敱鍒囨崲鐨勫墠鎻愪笅缁х画鎵╁睍銆?
## 2026-06-01 16:05:00 +08:00 | v0.0.57 | 绉婚櫎 AI 钀界偣棰勮鐨勫欢杩熻矾鐢卞洖鍐欎互淇鍥捐氨棰勮鍚庡垏椤靛崱浣?### 浠诲姟鍐呭
- 鏍规嵁澶嶇幇绾跨储缁х画鎺掓煡鈥滃彧鏈夎Е鍙?AI 棰勮钀界偣鍚庯紝鍒囨崲鍒扮瑪璁扮瓑鍏朵粬璺敱鏃堕〉闈㈡墠鍗″湪鍥捐氨鈥濈殑闂銆?- 鏀舵潫鍥捐氨椤?AI 钀界偣棰勮鐨勬煡璇㈠弬鏁版竻鐞嗘柟寮忥紝閬垮厤棰勮缁撴潫鍚庣殑寤惰繜瀵艰埅骞叉壈鍚庣画姝ｅ父鍒囬〉銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 淇濈暀 AI 钀界偣棰勮楂樹寒涓庤閲庡畾浣嶉€昏緫
  - 灏嗏€滄竻鐞嗚惤鐐归瑙堟煡璇㈠弬鏁扳€濈殑鍔ㄤ綔浠?2.6 绉掑悗鐨勫欢杩?`navigate` 鏀规垚棰勮瑙﹀彂鍚庣珛鍗虫墽琛?  - 璁℃椂鍣ㄧ幇鍦ㄥ彧璐熻矗鍏抽棴鏈湴 `focusPreview` 楂樹寒锛屼笉鍐嶆壙鎷呬换浣曡矾鐢卞洖鍐欒亴璐?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 瑙﹀彂杩?AI 棰勮钀界偣鍚庯紝鍥捐氨椤典笉鍐嶄繚鐣欎竴涓偓鑰屾湭鍐崇殑寤惰繜瀵艰埅锛屽垏鍘?`/notes`銆乣/materials` 绛夐〉闈㈡椂涓嶄細鍐嶈鍥捐氨椤电殑鍚庣疆鏇挎崲鍔ㄤ綔鎷栧洖鍘汇€?- 杩欎篃鎶娾€滈珮浜瑙堚€濆拰鈥滃湴鍧€鏍忔竻鐞嗏€濆交搴曡В鑰︼紝鍚庨潰濡傛灉缁х画寮哄寲鍥捐氨棰勮浜や簰锛岃矾鐢卞眰闈㈢殑鍓綔鐢ㄤ細鏇村彲鎺с€?
## 2026-06-01 15:42:00 +08:00 | v0.0.56 | 鍔犲己璺敱瀛愭爲閲嶆寕杞戒互淇鍥捐氨鍒囧埌绗旇浠嶅仠鐣欏師椤甸潰鐨勯棶棰?### 浠诲姟鍐呭
- 缁х画鎺掓煡鐢ㄦ埛鍙嶉鐨勨€滀粠鍥捐氨鍒囧埌绗旇鏃?URL 宸插彉鎴?`/notes`锛屼絾鐣岄潰浠嶅仠鐣欏湪鍥捐氨鈥濈殑闂銆?- 鍦ㄥ凡涓轰富宸ヤ綔鍖哄鍔犺矾寰?key 鐨勫熀纭€涓婏紝鍐嶈ˉ涓€灞傛洿绋冲畾鐨勮矾鐢辩骇閲嶆寕杞戒繚鎶わ紝閬垮厤鏃ч〉闈㈠疄渚嬫畫鐣欍€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 鍦?`App` 椤跺眰璇诲彇褰撳墠 `location.pathname`
  - 涓?`<Routes>` 澧炲姞 `key={location.pathname}`锛岃姣忔涓昏矾寰勫垏鎹㈡椂鏁存５褰撳墠璺敱瀛愭爲閲嶆柊鎸傝浇
  - 閰嶅悎姝ゅ墠 `ShellFrame` 鍐呴儴 `main-grid` 鐨勮矾寰?key锛屼竴璧锋秷闄ゅ浘璋遍〉绂诲紑鍚庣殑娈嬬暀娓叉煋鐘舵€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪浠?`/graph` 鍒囧埌 `/notes`銆乣/materials`銆乣/community` 杩欑被涓绘ā鍧楁椂锛岄〉闈細鎸夎矾鐢遍噸鏂板缓绔嬶紝涓嶅啀渚濊禆鍗曚釜椤甸潰鑷繁鏄惁娓呯悊瀹屾暣銆?- 濡傛灉鍚庨潰缁х画鎶婃洿澶氬鏉備氦浜掑爢杩涘浘璋遍〉锛岃繖灞傝矾鐢辩骇閲嶆寕杞戒篃鑳界户缁厹浣忓垏椤电ǔ瀹氭€с€?
## 2026-06-01 15:20:00 +08:00 | v0.0.55 | 淇鍥捐氨椤靛垏鎹㈠悗椤甸潰涓嶅埛鏂扮殑鍗℃闂骞堕噸寤洪」鐩棩蹇楃紪鐮?### 浠诲姟鍐呭
- 妫€鏌?`PROJECT_LOG.md` 涓悗缁柊澧炶褰曠殑涔辩爜銆侀噸澶嶆鍜屾贩鍚堢紪鐮侀棶棰橈紝鎭㈠鎴愬彲鎸佺画缁存姢鐨勬甯镐腑鏂囨枃妗ｃ€?- 淇鍓嶇鍦ㄨ繘鍏?`/graph` 鍚庡啀鍒囨崲鍒板叾浠栨ā鍧楁椂鈥滃湴鍧€鏍忓凡鍙樺寲锛屼絾椤甸潰鍐呭浠嶅仠鐣欏湪鍥捐氨鈥濈殑鍒囬〉鍗℃闂銆?### 瀹屾垚缁撴灉
- 閲嶅缓 `PROJECT_LOG.md`锛?  - 浠?`28bff0b` 鎻愪氦涓殑骞插噣鍘嗗彶璁板綍涓哄熀搴?  - 閲嶆柊鏁寸悊骞惰ˉ鍥?`v0.0.50` 鍒?`v0.0.54` 鐨勭増鏈褰?  - 鍒犻櫎鍚庡崐娈甸噸澶嶈拷鍔犵殑鎹熷潖鍐呭锛屽苟缁熶竴淇濆瓨涓?UTF-8 缂栫爜
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 涓?`ShellFrame` 鍐呴儴鐨?`main-grid` 澧炲姞 `key={location.pathname}`
  - 璁╀粠鍥捐氨椤靛垏鎹㈠埌鍏朵粬璺敱鏃讹紝涓诲伐浣滃尯瀛愭爲鎸夎矾寰勯噸鏂版寕杞斤紝閬垮厤鍥捐氨椤垫畫鐣欑姸鎬侀樆姝㈤〉闈㈠埛鏂?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- `PROJECT_LOG.md` 閲嶆柊鍥炲埌绋冲畾鍙鐘舵€侊紝鍚庣画缁х画杩藉姞璁板綍鏃朵笉浼氬啀琚綋鍓嶈繖娈垫贩鍚堢紪鐮佸巻鍙叉嫋鍧忋€?- 鍥捐氨宸ヤ綔鍖虹寮€鍚庝細骞插噣鍗歌浇锛涘鏋滃悗闈㈣繕瑕佺户缁寮虹敾甯冧氦浜掞紝寤鸿鎶婂浘璋遍〉閲屼笌鍏ㄥ眬鐩戝惉鍣ㄣ€佸畾鏃跺櫒鐩稿叧鐨勫壇浣滅敤缁х画淇濇寔鈥滆繘鍏ュ嵆鎸傝浇銆佺寮€鍗虫竻鐞嗏€濈殑杈圭晫銆?
## 2026-06-01 14:10:00 +08:00 | v0.0.54 | 鎵╁瀛︿範宸ヤ綔鍙板３灞傚苟閲嶆帓棣栭〉宸ヤ綔鍖轰互鍏呭垎鍒╃敤澶у睆椤甸潰
### 浠诲姟鍐呭
- 鍝嶅簲娴忚鍣ㄦ壒娉ㄤ腑鈥滈渶瑕佸厖鍒嗕娇鐢ㄦ暣涓〉闈⑩€濈殑鍙嶉锛屾敹绱?StudyMate 棣栭〉涓庡３灞備腑杩囧鐨勭暀鐧姐€?- 鍦ㄤ笉鐗虹壊鐭ヨ瘑宸ヤ綔鍙版皵璐ㄧ殑鍓嶆彁涓嬶紝鎶婂ぇ灞忕┖闂磋浆鎴愮湡瀹炲彲鐢ㄧ殑宸ヤ綔闈紝鑰屼笉鏄崟绾斁澶х┖鐧藉尯鍩熴€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛?  - 灏?shell 鏈€澶у搴︺€佷晶鏍忎笌涓婁笅鏂囨爮瀹藉害閲嶆柊鏍″噯锛岃鐢ㄦ埛绔湪 2K/瓒呭灞忎笅浣跨敤鏇村妯悜绌洪棿
  - 鏀惧鎼滅储鏍忎笌涓诲伐浣滃尯鍐呰竟璺濓紝骞惰鍙充晶 context panel 鏀逛负 sticky锛屾彁鍗囬暱椤垫祻瑙堟椂鐨勪俊鎭即闅忔劅
  - 閲嶅仛 dashboard 棣栭〉缃戞牸锛屾敼鎴愪富宸ヤ綔鍒?+ 渚ц竟宸ヤ綔鍒楃殑甯冨眬锛岃涓婂崐灞忎笉鍐嶇┖鐫€
  - 涓洪椤垫柊澧?story-card grid銆乤ction grid銆乪mpty card 绛夋牱寮忥紝淇濊瘉鎵╁鍚庝笉鏄€滄洿瀹界殑绌虹櫧鈥濓紝鑰屾槸鈥滄洿澶х殑宸ヤ綔闈⑩€?- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 缁?SectionFrame 澧炲姞 className 鎵╁睍鑳藉姏锛屾柟渚块椤典笉鍚屽伐浣滃尯閲囩敤宸紓鍖栧竷灞€
  - 鎶婇椤电殑鈥滄渶杩戣祫鏂?/ 鏈€杩戠瑪璁?/ 楂橀鍏ュ彛 / 绀惧尯鍔ㄦ€佲€濋噸鏂扮紪鎺掕繘鍙屽垪宸ヤ綔鍙扮粨鏋?  - 鎶婂揩閫熷姩浣滄敼鎴愮湡瀹炲彲鐐瑰嚮鍏ュ彛锛屽苟鏍规嵁鐧诲綍鐘舵€佽嚜鍔ㄨ烦杞埌鐩爣椤垫垨鐧诲綍椤?  - 鎵╁ぇ棣栭〉鏈€杩戣祫鏂欍€佺瑪璁般€佺ぞ鍖哄唴瀹圭殑灞曠ず鏁伴噺锛岃棣栭〉鎵挎媴鏇村缁х画宸ヤ綔鍏ュ彛
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 杩欎竴杞妸棣栭〉浠庘€滃眳涓睍绀洪潰鈥濈户缁線鈥滅湡姝ｇ殑瀛︿範鍙伴潰鈥濇帹浜嗕竴姝ワ紝鍚庨潰鍐嶈ˉ鍥捐氨銆侀槄璇诲櫒鍜岀瑪璁伴〉鐨勫ぇ灞忎紭鍖栨椂鍙互鐩存帴娌跨敤杩欏瀹藉３灞傝鍒欍€?- 涓嬩竴姝ユ渶鍊煎緱缁х画鐨勬槸閽堝 `/reader`銆乣/notes`銆乣/graph` 鍋氬悓绾у埆鐨勫ぇ灞忓瘑搴︿紭鍖栵紝鎶婂綋鍓嶆洿瀹界殑澹冲眰杞崲鎴愭洿娣辩殑澶氶潰鏉垮崗浣滀綋楠屻€?
## 2026-06-01 13:42:00 +08:00 | v0.0.53 | 閲嶅仛 StudyMate 鍓嶅悗鍙颁骇鍝?UI 椋庢牸骞跺洖閫€瀵瑰閮ㄩ」鐩殑鐓ф惉甯冨眬
### 浠诲姟鍐呭
- 鍥為€€姝ゅ墠瀵?`Zhenmeng8023/IT` 椋庢牸鐨勮繃搴﹀€熺敤锛屼笉鍐嶆部鐢ㄩ偅濂楀亸鍐疯壊鐜荤拑鍗＄墖鐨勫竷灞€澹冲眰銆?- 閲嶆柊鎸?StudyMate 浣滀负鐭ヨ瘑宸ヤ綔鍙扮殑浜у搧瀹氫綅锛岀粺涓€鐢ㄦ埛绔€佸浘璋卞伐浣滃尯銆丄I/鎼滅储/澶嶄範鍗＄墖鍜屽悗鍙版不鐞嗙晫闈㈢殑 UI 璇█銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛?  - 閲嶅缓鐢ㄦ埛绔?shell token锛屾敼鎴愭洿鍏嬪埗鐨勪腑鎬ц壊 + 娣辩豢寮鸿皟鑹诧紝鏀跺洖杩囬噸鐨勭幓鐠冨崱鐗囦笌钃濋潚娓愬彉
  - 閲嶆柊璁捐渚ф爮銆侀《閮ㄥ伐鍏锋潯銆佷笂涓嬫枃闈㈡澘涓庝富宸ヤ綔鍖哄眰绾э紝璁╅〉闈㈡洿鎺ヨ繎鐭ヨ瘑宸ヤ綔鍙拌€屼笉鏄弬鑰冮」鐩殑澶栧３
  - 缁熶竴鍥捐氨宸ヤ綔鍖虹殑 stage銆佽妭鐐广€佸彸閿彍鍗曘€佺缉鐣ュ浘銆佸揩鎹烽敭闈㈡澘涓庡绫诲伐浣滃崱鐗囩殑鍦嗚銆佸簳鑹插拰鐘舵€佽涔?  - 椤烘墜淇婵€娲绘€佹寜閽鐢ㄥ嵄闄╃孩鑹茬殑闂锛屽苟鎶婃悳绱€丄I銆佸涔犮€佺櫥褰曢〉绛夊父鐢ㄩ潰鏉夸竴璧锋敹鍥炲悓涓€濂楄瑙夎瑷€
- 鏇存柊 [frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue)锛?  - 灏嗗悗鍙伴噸鏋勪负娣辫壊宸﹀鑸?+ 娴呰壊鍐呭鍖虹殑娌荤悊鎺у埗鍙伴鏍?  - 鍘绘帀鐓ф惉鑰屾潵鐨勮摑鐏扮幓鐠冩劅锛岀粺涓€鎸夐挳銆佸崱鐗囥€佽緭鍏ユ鍜岄《鏍忚妭濂?- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 淇椤舵爮鎼滅储妗嗗崰浣嶆枃妗堬紝鎭㈠姝ｅ父涓枃鎻愮ず
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- 杩欎竴杞妸 StudyMate 鐨勫墠绔鏍间粠鈥滃弬鑰冮」鐩奖瀛愨€濇媺鍥炲埌鏇撮€傚悎鐭ヨ瘑鏁寸悊涓庡涔犳祦鐨勪骇鍝佸熀璋冿紝鍚庨潰缁х画鎵╁睍鍥捐氨銆丄I 鍜屽涔犻〉鏃跺彲浠ョ洿鎺ユ部鐢ㄨ繖濂楀３灞傚拰鍗＄墖璇硶銆?- 涓嬩竴姝ラ€傚悎缁х画鍋氶〉闈㈢骇缁嗗寲锛屼緥濡傚浘璋辫鎯呬晶鏍忕殑瀵嗗害浼樺寲銆侀槄璇诲櫒宸ュ叿鏉＄殑淇℃伅缁勭粐锛屼互鍙婄Щ鍔ㄧ澹冲眰鐨勮繘涓€姝ユ敹鏉熴€?
## 2026-06-01 12:08:00 +08:00 | v0.0.52 | 缁х画鎵撶（鍥捐氨宸ヤ綔鍖虹殑鍚搁檮鎻愮ず銆佸揩鎹烽敭璇存槑涓庢壒閲忔潵婧愭暣鐞?### 浠诲姟鍐呭
- 鎸?[docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 缁х画鏀舵潫 `v0.5.0 / v0.6.0` 鍥捐氨宸ヤ綔鍖猴紝浼樺厛琛ラ綈澶氶€夊満鏅笅鐨勫惛闄勫弽棣堛€佸揩鎹烽敭鍏ュ彛鍜屾寜鏉ユ簮鏁寸悊鑳藉姏銆?- 鐩爣涓嶆槸鍐嶅姞闆舵暎鎸夐挳锛岃€屾槸璁?20+ 鑺傜偣鍥捐氨鐨勬暣鐞嗚繃绋嬫洿椤烘墜銆佹洿鍙鏈熴€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鎵╁睍瀵归綈鍙傝€冪嚎閫昏緫锛屼负鍚搁檮缁撴灉琛ヤ笂宸﹁竟 / 鍙宠竟 / 涓嚎 / 椤惰竟 / 搴曡竟绾у埆鐨勮涔夋彁绀?  - 鍦?stage 鐘舵€佸尯鏂板鍚搁檮鎻愮ず pill锛岃鎷栧姩鏃朵笉鍙湅鍒扮嚎锛岃繕鐭ラ亾褰撳墠鍚搁檮鍒颁粈涔?  - 鏂板蹇嵎閿潰鏉垮叆鍙ｏ紝骞舵敮鎸?`?` 鎵撳紑鎴栧叧闂?  - 琛ヤ笂鍥捐氨宸ヤ綔鍖虹儹閿細`Ctrl/Cmd+A` 鍏ㄩ€夊彲瑙佽妭鐐广€乣F` 鑱氱劍鑺傜偣銆乣G` 寤虹粍銆乣L` 杩炵嚎妯″紡銆乣0` 閲嶇疆瑙嗛噹
  - 涓哄閫夎妭鐐规柊澧炩€滄寜鏉ユ簮鍒嗗垪 / 鎸夋潵婧愬垎琛?/ 鐢熸垚鏉ユ簮鍒嗙粍鈥濅笁绉嶆暣鐞嗗姩浣?  - 澧炲姞鏉ユ簮缁熻鎽樿锛岃鎵归噺鏁寸悊鍓嶅厛鐪嬪埌褰撳墠閫変腑鑺傜偣鐨勬潵婧愭瀯鎴?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛?  - 琛ュ厖鍚搁檮鎻愮ず pill銆佸揩鎹烽敭闈㈡澘銆佹潵婧愭憳瑕佽兌鍥婄瓑鏍峰紡
  - 璁╂柊鍔犵殑宸ヤ綔鍙版彁绀哄眰寤剁画鐜版湁 graph workspace 鐨勪骇鍝佸寲瑙嗚璇皵
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 杩欎竴姝ユ妸鍥捐氨宸ヤ綔鍖轰粠鈥滃閫夊凡鍙敤鈥濆線鈥滃閫夋暣鐞嗙湡鐨勯『鎵嬧€濇帹杩涗簡涓€鎴紝鐗瑰埆閫傚悎鍚庨潰缁х画鎵╁浘璋变骇鍝佸寲鍔熻兘鏃跺鐢ㄣ€?- 涓嬩竴姝ユ渶鍊煎緱缁х画鐨勬槸鍋氭洿缁嗙殑鍚搁檮浣撻獙锛屾瘮濡傝妭鐐逛笌鍒嗙粍杈圭晫鐨勫惛闄勩€佹嫋鍔ㄦ椂鐨勯棿璺濇彁绀猴紝浠ュ強鎶婃壒閲忔潵婧愭暣鐞嗚繘涓€姝ユ墿鍒扳€滄寜鏉ユ簮鑷姩鐢熸垚娉抽亾甯冨眬鈥濄€?
## 2026-06-01 00:20:41 +08:00 | v0.0.51 | 缁х画鍔犲帤鍥捐氨宸ヤ綔鍖虹殑鎵归噺鏍峰紡涓庢嫋鍔ㄥ弬鑰冭兘鍔?### 浠诲姟鍐呭
- 缁х画鍦?[docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 鍜?[docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 鑼冨洿鍐呮帹杩?`v0.6` 鍥捐氨浜у搧鍖栵紝涓嶅仠鐣欏湪鈥滆兘澶氶€夆€濓紝鑰屾槸缁х画琛モ€滃閫変箣鍚庢€庝箞鏇撮珮鏁堝湴鏁寸悊鈥濄€?- 缁撳悎鏈湴 ECC 鐨?`product-capability / tdd-workflow / verification-loop` 鎬濊矾鍜?CodeGraph 涓婁笅鏂囷紝浼樺厛瀹炵幇鈥滄嫋鍔ㄥ榻愬弬鑰冪嚎鈥濅笌鈥滄壒閲忔牱寮忕紪杈戔€濊繖涓ゅ潡鏁寸悊鏁堢巼鑳藉姏銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板瀵归綈鍙傝€冪嚎璁＄畻閫昏緫锛屽崟鑺傜偣鍜屽鑺傜偣鎷栧姩鏃堕兘浼氬拰鏈€変腑鑺傜偣鍋氳竟缂?/ 涓績鍚搁檮鍒ゆ柇
  - 鎷栧姩杩囩▼涓細瀹炴椂鏄剧ず鍨傜洿 / 姘村钩鍙傝€冪嚎锛岀粨鏉熸嫋鍔ㄣ€佸垏鎹㈢敾甯冩垨鎸?`Esc` 鏃朵細鑷姩娓呯┖
  - 澶氶€夐潰鏉挎柊澧炴壒閲忛鑹层€佹壒閲忓己璋冦€佹壒閲忓昂瀵告帶鍒讹紝鐩存帴澶嶇敤鐜版湁鑺傜偣鏍峰紡妯″瀷鎵归噺鍐欏洖 metadata
  - 鎵归噺缂栬緫浼氳瘑鍒綋鍓嶆槸鍚︹€滄牱寮忎竴鑷粹€濓紝浠庤€屾纭偣浜綋鍓嶉€夐」锛岃€屼笉鏄洸鐩樉绀哄崟鍊?  - 椤烘墜淇杈归€夐€昏緫閲岀殑鑺傜偣閫夋嫨娓呯悊锛岄伩鍏嶈妭鐐瑰閫夋畫鐣欏共鎵拌繛绾跨紪杈?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭榻愬弬鑰冪嚎鐨勫彲瑙嗗寲鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鍒拌繖涓€姝ワ紝鍥捐氨宸ヤ綔鍖哄凡缁忎粠鈥滆兘妗嗛€夊拰鎵归噺绉诲姩鈥濈户缁帹杩涘埌鈥滄壒閲忕Щ鍔ㄦ椂鏇存湁鍙傜収銆佹壒閲忔暣鐞嗘椂鏇村皯閲嶅鍔冲姩鈥濓紝绂?`v0.6.0` 閲屸€滈€傚悎闀挎湡鏁寸悊鐭ヨ瘑鈥濈殑鐩爣鍙堣繎浜嗕竴姝ャ€?- 涓嬩竴姝ユ渶椤虹殑鏄户缁ˉ鈥滃惛闄勬彁绀烘枃妗?/ 蹇嵎閿鏄?/ 鎵归噺鏉ユ簮鏍囪鈥濓紝鎴栬€呮妸杩欏澶氶€夋暣鐞嗚兘鍔涚户缁帴鍒?AI 鑽夌纭鍚庣殑钀藉浘娴佺▼閲屻€?
## 2026-06-01 11:36:00 +08:00 | v0.0.50 | 瀵规爣 Zhenmeng8023/IT 鏀舵潫 StudyMate 鍓嶅悗鍙颁骇鍝佸寲 UI 椋庢牸
### 浠诲姟鍐呭
- 鎸夌敤鎴疯姹傚涔犲弬鑰冮」鐩?`Zhenmeng8023/IT` 鐨勫墠绔晫闈㈤鏍硷紝骞剁粨鍚堟湰鍦?`design-taste-frontend` skill锛屾妸瀹冪炕璇戞垚閫傚悎 StudyMate 鐨勪骇鍝?UI 璇█锛岃€屼笉鏄洿鎺ョ収鎼?Element UI 瑙嗚銆?- 鍩轰簬 CodeGraph 鍜屾簮鐮侀槄璇伙紝浼樺厛鏀舵潫鍓嶅彴瀛︿範宸ヤ綔鍖轰笌鍚庡彴娌荤悊鎺у埗鍙扮殑澹冲眰銆佸鑸€侀潰鏉裤€佸崱鐗囥€佸伐鍏锋潯鍜屾寜閽郴缁燂紝璁╂暣浣撶晫闈粠鈥滃崟椤靛悇鑷垚绔嬧€濆崌绾ф垚鈥滃悓涓€瀹朵骇鍝佺殑缁熶竴宸ヤ綔鍙扳€濄€?### 瀹屾垚缁撴灉
- 鍙傝€冧粨搴撴湰鍦板垎鏋愶細
  - 璇诲彇骞舵媶瑙?`E:/Code/reference-ui/IT/it-ui/ui/layouts/manage.vue`
  - 璇诲彇骞舵媶瑙?`E:/Code/reference-ui/IT/it-ui/ui/components/front/FrontNavShell.vue`
  - 璇诲彇骞舵媶瑙?`E:/Code/reference-ui/IT/it-ui/ui/components/admin/AdminTableCard.vue`
  - 鎻愮偧鍑洪€傚悎 StudyMate 鐨勪笁鏉¤璁′富绾匡細涓婚 token 鍖栥€佸墠鍚庡彴绋冲畾澹冲眰銆佸鐢ㄥ瀷椤甸潰鍘熻
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛?  - 閲嶅缓鐢ㄦ埛绔璁?token锛屾敼涓烘洿鍋忎骇鍝佸寲鐨勫喎闈欎腑鎬ц壊鍩哄簳锛屼繚鐣?StudyMate 鑷繁鐨勫涔犳劅浣嗗噺杞诲師鍏堝亸鏆栧亸鏉傚織鍖栫殑瑙傛劅
  - 鏂板 shell / sidebar / context rail / topbar 绾у埆鐨勭粨鏋勫彉閲忥紝缁熶竴瀹藉害銆佸渾瑙掋€侀槾褰便€佽〃闈㈠眰绾т笌鍚搁《琛屼负
  - 璁?`workspace-surface / context-panel / section-frame / metric-tile / sidebar-card` 杩涘叆鍚屼竴闈㈡澘绯荤粺
  - 鎶婁富瑕佹爣棰樸€佸浘璋卞崱鐗囥€佸涔犲崱鐗囩瓑浠庡ぇ闈㈢Н琛嚎鍒囧洖鏇寸ǔ鐨勪骇鍝佸瓧浣撴潈閲嶏紝鍑忓皯 UI 鐨勨€滅紪杈戝櫒娴锋姤鎰熲€?  - 缁熶竴鎸夐挳銆佺瓫閫?chip銆佹悳绱㈡鍜屽鑸」鐨勪氦浜掑舰鎬侊紝璁╁伐鍏锋搷浣滄洿鍍忓伐浣滃彴鑰屼笉鏄惀閿€椤电粍浠?- 鏇存柊 [frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue)锛?  - 閲嶆瀯鍚庡彴 scoped 鏍峰紡 token锛屼娇鍚庡彴涓庣敤鎴风杩涘叆鍚屼竴濂椾骇鍝佸鏃?  - 鎶婂悗鍙拌皟鏁翠负鏇存帴杩?IT 鍙傝€冮」鐩殑娌荤悊鎺у埗鍙扮粨鏋勶細绋冲畾宸︿晶瀵艰埅銆佸惛椤?topbar銆佺姸鎬佹潯銆佹暟鎹崱鍜屽唴瀹瑰崱灞傜骇
  - 鏀舵潫鐧诲綍鍗°€佸鑸」銆佸鏍稿崱銆佸崰浣嶆ā鍧楀崱鍜屾寜閽牱寮忥紝浣垮悗鍙颁笉鍐嶅彧鏄€滆兘鐢ㄢ€濓紝鑰屾槸鏇存帴杩戠湡瀹炶繍钀ュ彴
  - 鏂板 `status-stack`锛屾妸 notice 涓?error 淇℃伅鏀剁撼鍒颁竴鑷寸殑鐘舵€佸尯锛岃€屼笉鏄暎钀藉湪鍐呭娴侀噷
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- 杩欒疆涓嶆槸琛ュ崟涓姛鑳斤紝鑰屾槸琛ヤ簡涓€灞備細鎸佺画褰卞搷鍚庣画寮€鍙戠殑鍓嶇璁捐鍩虹璁炬柦銆傚悗闈㈢户缁仛鍥捐氨銆佸涔犮€丄I銆佹悳绱㈠拰鍚庡彴娌荤悊椤垫椂锛屽彲浠ョ洿鎺ユ部鐫€杩欏澹冲眰鍜岄潰鏉夸綋绯绘墿灞曪紝鑰屼笉鐢ㄦ瘡椤甸噸鏂版壘瑙嗚璇皵銆?- 涓嬩竴姝ユ渶鍊煎緱缁х画鐨勬槸鎶婄敤鎴风椤甸潰鍐呴儴鍐嶈繘涓€姝ョ粍浠跺寲锛岃ˉ鍑烘洿鏄庣‘鐨?`page header / table card / filter bar / side rail` 鍘熻锛屽苟閫愭鎶婅秴澶х殑 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 鍜?[frontend-admin/src/App.vue](/E:/Code/1108026_rust_go/StudyMate/frontend-admin/src/App.vue) 鎷嗘垚鏇存竻鏅扮殑 UI 缁撴瀯浠躲€?
## 2026-05-31 23:46:27 +08:00 | v0.0.49 | 琛ラ綈鍥捐氨浜у搧鍖栭噷鐨?PNG 瀵煎嚭涓庤妭鐐瑰彸閿彍鍗?### 浠诲姟鍐呭
- 缁х画鍦?[docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 鑼冨洿鍐呮帹杩涘浘璋卞伐浣滃尯锛屾妸鈥滃鍏ュ鍑哄叆鍙ｂ€濆拰鈥滄洿椤烘墜鐨勭敾甯冧氦浜掆€濆仛寰楁洿鍍忓畬鏁翠骇鍝併€?- 鍩轰簬 CodeGraph 姊崇悊褰撳墠鍥捐氨椤电殑瀵煎嚭閾捐矾鍜岃妭鐐逛氦浜掑叆鍙ｅ悗锛屼紭鍏堣ˉ `PNG 瀵煎嚭` 涓?`鍙抽敭鑿滃崟` 杩欎袱涓槑鏄捐繕娆犱竴鎴殑鑳藉姏銆?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板 PNG 瀵煎嚭閫昏緫锛屽鐢ㄧ幇鏈?SVG 娓叉煋缁撴灉鐢熸垚 PNG 鏂囦欢
  - 宸ュ叿鏍忕幇鍦ㄥ悓鏃舵彁渚?PNG 鍜?SVG 涓ょ瀵煎嚭鍏ュ彛
  - 鐢诲竷銆佽妭鐐瑰拰杩炵嚎閮芥帴鍏ュ彸閿彍鍗?  - 鑺傜偣鍙抽敭鑿滃崟鏀寔鑱氱劍銆佸鍒躲€佸缓绔嬪垎缁勩€佽缃繛绾胯捣鐐广€佹墦寮€鏉ユ簮銆佸垹闄?  - 杩炵嚎鍙抽敭鑿滃崟鏀寔鐩寸嚎/鏇茬嚎鍒囨崲鍜屽垹闄?  - 鐢诲竷绌虹櫧澶勫彸閿彍鍗曟敮鎸佸揩閫熸柊寤鸿妭鐐瑰拰鐩存帴瀵煎嚭 PNG
- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭彸閿彍鍗曚笌鑿滃崟椤规牱寮忋€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鍒拌繖涓€姝ワ紝鍥捐氨椤靛凡缁忔洿鎺ヨ繎 `v0.6.0` 鏂囨。閲岃鐨勨€滈€傚悎闀挎湡鏁寸悊鐭ヨ瘑鈥濈殑宸ヤ綔鍖轰簡锛氬鍑轰笉鍐嶅彧鍓?SVG锛屽父鐢ㄨ妭鐐规搷浣滀篃涓嶅繀鍙嶅璺戝埌渚ц竟鏍忋€?- 涓嬩竴姝ユ渶椤虹殑鏄户缁ˉ `v0.5.0` 閲岃繕鍋忓急鐨勪氦浜掗」锛屾瘮濡傛閫夛紱鎴栬€呯户缁妸鍙抽敭鑿滃崟鍜屾潵婧愪笂涓嬫枃鑱斿姩寰楁洿娣憋紝渚嬪浠庢潗鏂欒妭鐐瑰彸閿洿鎺ュ洖闃呰鍣ㄥ苟灏介噺淇濈暀涓婁笅鏂囥€?
## 2026-05-31 23:32:28 +08:00 | v0.0.48 | 缁х画琛ラ綈鍥捐氨鑺傜偣鏉ユ簮鍥炵湅涓庤烦杞摼璺?### 浠诲姟鍐呭
- 缁х画娌跨潃 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 鐨勫浘璋辨敹鏉熸柟鍚戯紝琛ュ己鑺傜偣璇︽儏閲岀殑鈥滄潵婧愪笂涓嬫枃鍥炵湅鈥濊兘鍔涖€?- 璁╁浘璋变腑鐨勬潵婧愯妭鐐逛笉鍙槸鏄剧ず鏉ユ簮鏍囩锛岃€屾槸鍙互鐩存帴鍥炲埌绗旇銆侀槄璇诲櫒鎴栧涔犻〉鏌ョ湅鍘熷涓婁笅鏂囥€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏂板鑺傜偣鏉ユ簮绫诲瀷鍒扮洰鏍囬〉闈㈢殑璺宠浆鏄犲皠
  - 鑺傜偣璇︽儏闈㈡澘閲屾柊澧炩€滃洖鍒伴槄璇诲櫒 / 鍥炲埌绗旇 / 鍘诲涔犻〉鈥濆揩鎹峰叆鍙?  - 鏉ユ簮鏍囪瘑鐜板湪浼氭樉绀烘洿鍙嬪ソ鐨勬潵婧愮被鍨嬪悕绉帮紝鑰屼笉鏄彧鏄剧ず鍘熷 type
  - 瀵规病鏈夋憳褰曞唴瀹逛絾瀛樺湪鏉ユ簮寮曠敤鐨勮妭鐐癸紝琛ュ厖浜嗏€滄潵婧愪笂涓嬫枃鈥濇彁绀烘枃妗堬紝鎻愰啋鐢ㄦ埛鍥炲師椤甸潰鏌ョ湅
### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪鍥捐氨鑺傜偣宸茬粡涓嶅彧鏄€滄壙杞芥潵婧愪俊鎭€濓紝鑰屾槸寮€濮嬬湡姝ｈ繘鍏モ€滃浘璋辨暣鐞?-> 鍥炲師濮嬩笂涓嬫枃 -> 鍐嶅洖鏉ョ户缁暣鐞嗏€濈殑寰€杩斿伐浣滄祦銆?- 涓嬩竴姝ユ渶椤虹殑鏄妸璺宠浆鍋氬緱鍐嶇簿涓€鐐癸紝渚嬪浠庡浘璋卞洖鍒扮瑪璁版椂鑷姩瀹氫綅鍒扮洰鏍?note锛屾垨鑰呭洖鍒伴槄璇诲櫒鏃跺甫涓婃洿鍏蜂綋鐨勬壒娉?椤电爜涓婁笅鏂囥€?
## 2026-05-31 22:47:40 +08:00 | v0.0.47 | 缁х画琛ラ綈鍥捐氨鑺傜偣璇︽儏缁撴瀯鐨勬潵婧愰瑙堜笌灏哄棰勮
### 浠诲姟鍐呭
- 缁х画娌跨潃 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 鍜?[docs/planning/versions/v0.6.0-graph-product.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/versions/v0.6.0-graph-product.md) 鐨勬柟鍚戞敹鏉熷浘璋卞伐浣滃尯锛屾妸鈥滆妭鐐硅鎯呪€濅粠鍩虹缂栬緫鍐嶅線鍓嶆帹杩涗竴姝ャ€?- 浼樺厛琛ラ暱鏈熸暣鐞嗙煡璇嗘椂鏈€甯哥敤鐨勪袱涓粏鑺傦細鏉ユ簮鎽樺綍棰勮锛屼互鍙婅妭鐐瑰昂瀵搁璁俱€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鑺傜偣璇︽儏闈㈡澘鏂板鈥滅揣鍑?/ 鏍囧噯 / 灞曞紑鈥濅笁妗ｅ昂瀵搁璁?  - 鑺傜偣璇︽儏闈㈡澘鏂板鑺傜偣瑙勬牸灞曠ず锛屼究浜庣悊瑙ｅ綋鍓嶈妭鐐瑰昂瀵?  - 褰撹妭鐐瑰甫鏈夋潵婧愪俊鎭椂锛屼細灞曠ず鏉ユ簮绫诲瀷/ID 鍜屾潵婧愭憳褰曢瑙?- 鏇存柊 [frontend-user/src/modules/graph/nodeAppearance.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/nodeAppearance.ts)锛岃ˉ鍏呰妭鐐瑰昂瀵搁璁惧畾涔夈€佸綋鍓嶅昂瀵稿垽鏂拰灏哄搴旂敤閫昏緫銆?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呰妭鐐硅鎯呭尯鐨勫弻鍒楀厓淇℃伅甯冨眬鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪鍥捐氨鑺傜偣宸茬粡鏇存帴杩戔€滃彲闀挎湡缁存姢鐨勭煡璇嗗崟鍏冣€濓細涓嶄粎鑳藉啓鏍囬鍜屾牱寮忥紝杩樿兘鎵胯浇鏉ユ簮涓婁笅鏂囷紝骞跺揩閫熷垏鎹㈠睍绀哄瘑搴︺€?- 涓嬩竴姝ユ渶椤虹殑鏄户缁ˉ鑺傜偣璇︽儏閲岀殑鈥滄潵婧愯烦杞?/ 涓婁笅鏂囧洖鐪嬧€濊兘鍔涳紝鎴栬€呮妸灏哄棰勮鍜?AI 钀界偣棰勮鑱斿姩璧锋潵锛岃瀵煎叆鍚庣殑鑺傜偣鏇村鏄撳氨鍦版暣鐞嗐€?
## 2026-05-31 22:36:02 +08:00 | v0.0.46 | 鎸夌増鏈鍒掕ˉ榻愬浘璋辫妭鐐硅鎯呬笌鍩虹鏍峰紡缂栬緫
### 浠诲姟鍐呭
- 渚濇嵁 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 褰撳墠搴斾紭鍏堟敹鏉?`v0.5.0 / v0.6.0` 鍥捐氨宸ヤ綔鍖虹殑瑕佹眰锛岀户缁ˉ榻愨€滆妭鐐硅鎯呯粨鏋勨€濆拰鈥滆妭鐐归鑹?鍩虹鏍峰紡缂栬緫鈥濊繖涓や釜浠嶇劧鍋忓急鐨勯獙鏀剁偣銆?- 淇濊瘉鍥捐氨鑺傜偣鐨勬牱寮忓拰璇︽儏 metadata 涓嶅彧鍋滅暀鍦ㄥ墠绔复鏃剁姸鎬侀噷锛岃€屾槸鑳借窡闅忎繚瀛樸€佸揩鐓у拰瀵煎嚭閾捐矾涓€璧风ǔ瀹氬瓨鍦ㄣ€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鑺傜偣璇︽儏闈㈡澘鏂板鈥滆妭鐐圭瑪璁扳€濈紪杈戯紝鍐欏叆鑺傜偣 `metadata.detail`
  - 鑺傜偣璇︽儏闈㈡澘鏂板棰滆壊鍒囨崲鍜屸€滈粯璁?/ 閲嶇偣 / 寮卞寲鈥濆己璋冩€佸垏鎹?  - 鍒嗙粍鍒楄〃鏀寔鐩存帴鏀瑰垎缁勬爣棰?  - 鐢诲竷涓婄殑鑺傜偣娓叉煋鍜?SVG 瀵煎嚭浼氫竴璧峰弽鏄犺妭鐐规牱寮?- 鏂板 [frontend-user/src/modules/graph/nodeAppearance.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/nodeAppearance.ts)锛岄泦涓皝瑁呭浘璋辫妭鐐规牱寮忚鍙栥€侀粯璁ゅ€笺€佹覆鏌?token 鍜?metadata 鍥炲啓閫昏緫锛岄伩鍏嶆牱寮忚鍒欐暎钀藉湪椤甸潰缁勪欢閲屻€?- 鏇存柊 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 鍜?[packages/graph-core/src/index.ts](/E:/Code/1108026_rust_go/StudyMate/packages/graph-core/src/index.ts)锛屾妸鑺傜偣 `appearance/detail` 鐩稿叧绫诲瀷琛ユ垚鏄庣‘缁撴瀯锛岃€屼笉鍐嶅彧鏄澗鏁ｇ殑 `Record<string, unknown>`銆?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呰妭鐐规牱寮忓垏鎹€佺揣鍑戝垎娈垫帶鍒跺拰鍒嗙粍鏍囬杈撳叆鐨勭晫闈㈡牱寮忋€?- 鏇存柊 [backend/internal/modules/graph/repository/document_repository_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/repository/document_repository_test.go)锛岃ˉ鍏呭浘璋辫妭鐐?metadata銆乼heme 鍜屾枃妗?metadata 鍦ㄦ寔涔呭寲鏋勫缓闃舵涓嶄細涓㈠け鐨勬祴璇曘€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `go test ./...`
### 鍚庣画褰卞搷
- 杩欎竴姝ヨ鍥捐氨椤垫洿璐磋繎 `v0.6.0 鍥捐氨浜у搧鍖栫増` 鐨勯獙鏀跺彛寰勶細鐜板湪鑺傜偣涓嶅彧鏄€滆兘鎷栥€佽兘杩炩€濓紝涔熷紑濮嬪叿澶囬暱鏈熸暣鐞嗙煡璇嗘椂闇€瑕佺殑鍩虹琛ㄨ揪鑳藉姏銆?- 涓嬩竴姝ユ渶椤虹殑鏄妸鑺傜偣绗旇鍜屽浘璋变晶杈归潰鏉跨户缁線鈥滆妭鐐硅鎯呯粨鏋勨€濇帹杩涳紝渚嬪琛ユ潵婧愭憳褰曢瑙堛€佽妭鐐瑰昂瀵?甯冨眬棰勮锛屾垨鑰呮妸 AI 钀界偣棰勮鐩存帴鎺ュ埌鑺傜偣璇︽儏缂栬緫娴侀噷銆?
## 2026-05-31 22:24:41 +08:00 | v0.0.45 | 鎸夌増鏈鍒掓敹鏉熷浘璋卞伐浣滃尯瀹氫綅棰勮骞朵慨姝ｉ儴鍒嗘帴鍙楄涔?### 浠诲姟鍐呭
- 渚濇嵁 [docs/planning/VERSION_PLAN.md](/E:/Code/1108026_rust_go/StudyMate/docs/planning/VERSION_PLAN.md) 褰撳墠鈥滀紭鍏堢ǔ浣忓浘璋卞伐浣滃尯鈥濈殑鏂瑰悜锛岀户缁妸 `/ai -> graph` 鐨勫畾浣嶉瑙堣ˉ鍒板彲鐢ㄧ姸鎬併€?- 淇鍥捐氨鍙樻洿鑽夌鈥滈儴鍒嗘帴鍙椻€濇椂鐨勫悗绔涔夛紝閬垮厤鏈€夎妭鐐硅鏁存潯鑽夌纭鍚庣洿鎺ヤ涪澶便€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 鏀寔閫氳繃鏌ヨ鍙傛暟鐩存帴鎵撳紑鐩爣 graph
  - 鏀寔鑷姩骞崇Щ鍒伴璁¤惤鐐瑰尯鍩熷苟鏄剧ず鐭殏楂樹寒妗?  - 棰勮缁撴潫鍚庤嚜鍔ㄦ竻鐞嗘煡璇㈠弬鏁?- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛岃 AI 鑽夌涓殑鍊欓€夎妭鐐瑰彲浠ヤ竴閿烦杞埌鐩爣鍥捐氨鏌ョ湅钀界偣銆?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭浘璋辫惤鐐归珮浜鏍峰紡銆?- 鏇存柊鍚庣鍥捐氨鑽夌搴旂敤閫昏緫锛?  - [backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go)
  - [backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)
  - [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)
  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  鐜板湪鍥捐氨鑽夌鎸夎妭鐐圭瓫閫夐儴鍒嗘帴鍙楀悗锛屼細鎶婃湭閫夎妭鐐逛繚鐣欏湪鑽夌閲岋紝鑰屼笉鏄妸鏁存潯鑽夌鐩存帴鏍囦负宸茬‘璁ゃ€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 杩欎竴姝ユ洿璐村悎鐗堟湰璁″垝閲?`v0.5.0 / v0.6.0` 鐨勫浘璋卞伐浣滃尯鏀舵潫鐩爣锛氫笉鏄户缁í鍚戞墿鍔熻兘锛岃€屾槸鎶婂浘璋辩紪杈戝拰棰勮閾捐矾鍋氭墡瀹炪€?- 涓嬩竴姝ユ渶椤虹殑鏄妸楂樹寒棰勮鍖哄煙鍜屽浘璋变晶杈瑰睘鎬ч潰鏉胯繛璧锋潵锛岃鐢ㄦ埛鍒颁簡 graph 椤靛悗鍙互鐩存帴鍥寸粫璇ュ尯鍩熺户缁紪杈戯紝鑰屼笉鍙槸鐪嬩竴鐪笺€?
## 2026-05-31 21:27:18 +08:00 | v0.0.44 | 鎵撻€?/ai 鍒板浘璋遍〉鐨勮惤鐐硅烦杞笌楂樹寒棰勮
### 浠诲姟鍐呭
- 璁?`/ai` 閲岀殑鍥捐氨鍙樻洿鍊欓€夎妭鐐逛笉姝㈣兘鐪嬪埌棰勮钀界偣锛岃繕鑳戒竴閿烦鍘荤洰鏍囧浘璋辨煡鐪嬭鍖哄煙銆?- 璁╁浘璋遍〉鏀跺埌瀹氫綅鍙傛暟鍚庤嚜鍔ㄥ垏鎹㈠埌鐩爣 graph銆佸钩绉诲埌棰勮鍖哄煙骞剁粰鍑虹煭鏆傞珮浜€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 鏂板鍥捐氨钀界偣璺宠浆閾炬帴鐢熸垚閫昏緫
  - 鍦ㄥ€欓€夎妭鐐瑰厓淇℃伅閲岃ˉ涓娾€滃幓鐩爣鍥捐氨鏌ョ湅钀界偣鈥濆叆鍙?- 鏇存柊 [frontend-user/src/modules/graph/GraphWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/graph/GraphWorkspacePage.tsx)锛?  - 璇诲彇 `graphId / focusX / focusY / focusWidth / focusHeight / focusLabel` 鏌ヨ鍙傛暟
  - 鍒濆鍔犺浇鏃朵紭鍏堟墦寮€鐩爣 graph
  - 鑷姩骞崇Щ瑙嗛噹鍒版寚瀹氬尯鍩燂紝骞舵覆鏌撶煭鏆傞珮浜
  - 楂樹寒缁撴潫鍚庤嚜鍔ㄦ竻鐞嗘煡璇㈠弬鏁?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭浘璋辫惤鐐归珮浜牱寮忎笌鍔ㄦ晥銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鐜板湪 `/ai -> graph` 宸茬粡涓嶆槸鎶借薄鐨勨€滃幓鐪嬬湅鈥濓紝鑰屾槸鑳界洿鎺ユ妸浜洪€佸埌棰勮鍖哄煙锛岀‘璁や笌鍚庣画缂栬緫鐨勯摼璺『浜嗗緢澶氥€?- 涓嬩竴姝ュ彲浠ョ户缁ˉ鈥滀粠楂樹寒鍖哄煙鍙嶅悜鎺ュ彈 / 鎷掔粷鑺傜偣鈥濇垨鑰呪€滃湪鍥捐氨椤电洿鎺ュ畬鎴愬悎骞跺缓璁€濓紝鎶婁袱杈瑰伐浣滃彴鐪熸杩炴垚涓€浣撱€?
## 2026-05-31 21:11:29 +08:00 | v0.0.43 | 涓哄浘璋卞彉鏇寸‘璁よˉ棰勮钀界偣涓庣浉浼艰妭鐐规彁绀?### 浠诲姟鍐呭
- 缁х画鎻愬崌 `/ai` 鍥捐氨鍙樻洿纭鏃剁殑绌洪棿鎰燂紝璁╁€欓€夎妭鐐逛笉鍙槸鈥滄湁鍚嶅瓧鈥濓紝鑰屾槸鑳芥彁鍓嶇湅鍒板ぇ鑷翠細钀藉埌鍥捐氨鍝竴鍧椼€?- 琛ュ厖涓庣洰鏍囧浘璋变腑宸叉湁鑺傜偣鐨勭浉浼兼彁绀猴紝鍑忓皯纭鏃剁殑绾枃鏈垽鏂礋鎷呫€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 涓哄浘璋卞彉鏇村€欓€夎妭鐐硅ˉ鍏呴璁″啓鍏ヤ綅缃帹绠?  - 涓烘瘡涓€欓€夎妭鐐硅ˉ鍏呪€滃乏渚?/ 涓儴 / 鍙充晶鈥濊惤鐐瑰尯鍩熸彁绀?  - 鍩轰簬鐩爣鍥捐氨褰撳墠鑺傜偣鏍囬锛岀粰鍑烘渶澶?3 涓浉浼煎凡鏈夎妭鐐规彁绀?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭€欓€夎妭鐐瑰厓淇℃伅鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- `/ai` 閲岀殑鍥捐氨鍙樻洿棰勮宸茬粡浠庘€滅湅鍊欓€夎妭鐐光€濆崌绾ф垚鈥滅湅鍊欓€夎妭鐐逛細钀藉埌鍝噷銆佸拰璋佹挒杞︹€濓紝纭浣撻獙鏇存帴杩戠湡瀹炵紪杈戝墠瀹￠槄銆?- 涓嬩竴姝ュ彲浠ョ户缁ˉ鈥滀粠棰勮鐩存帴璺冲幓鐩爣鍥捐氨瀹氫綅鍖哄煙鈥濆拰鈥滅浉浼艰妭鐐圭殑鍚堝苟寤鸿鈥濓紝鎶婄‘璁ゅ姩浣滃拰鍚庣画缂栬緫杩炶捣鏉ャ€?
## 2026-05-31 20:13:09 +08:00 | v0.0.42 | 涓哄浘璋卞彉鏇寸‘璁よˉ鑺傜偣绾у嬀閫変笌鐩爣鍥捐氨鍐茬獊鎻愮ず
### 浠诲姟鍐呭
- 鎶?`/ai` 涓浘璋卞彉鏇磋崏绋跨殑纭绮掑害缁х画涓嬫帰鍒拌妭鐐圭骇锛岃€屼笉鏄彧鎸夋暣鏉¤崏绋跨‘璁ゃ€?- 鍦ㄧ‘璁ゅ墠琛ョ洰鏍囧浘璋辩殑鍚屽悕鑺傜偣鍐茬獊鎻愮ず锛屽府鍔╃敤鎴峰垽鏂摢浜涘€欓€夎妭鐐瑰彲鑳戒細閲嶅銆?### 瀹屾垚缁撴灉
- 鎵╁睍鍚庣鍥捐氨纭璇锋眰锛?  - [backend/internal/modules/graph/dto/graph.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/dto/graph.go)
  - [backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go)
  - [backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)
  鐜板湪 `POST /api/v1/graphs/:id/ai/commit-changes` 鏀寔鎸?`draftId -> nodeIds` 浼犲叆鑺傜偣閫夋嫨锛屽悗绔細鑷姩杩囨护鏈€夎妭鐐瑰強鍏跺け鏁堣繛绾裤€?- 鏇存柊 [backend/internal/modules/graph/service/helpers_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers_test.go)锛岃ˉ涓婅妭鐐硅繃婊ゅ悗鐨勫簲鐢ㄦ祴璇曘€?- 鏇存柊鍓嶇锛?  - [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 鏂板甯?`nodeSelections` 鐨勫浘璋辩‘璁よ姹?  - [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 涓烘瘡鏉″浘璋卞彉鏇磋崏绋胯ˉ鑺傜偣绾у閫夋銆佺洰鏍囧浘璋卞悓鍚嶅啿绐佹彁绀猴紝骞跺湪纭鏃跺彧鎻愪氦淇濈暀鐨勮妭鐐?  - [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 琛ュ厖鑺傜偣绾у嬀閫夋牱寮?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- 鍥捐氨鍙樻洿纭娴佺幇鍦ㄥ凡缁忚兘鍋氬埌鈥滃厛鐪嬪啿绐侊紝鍐嶆寜鑺傜偣瑁佸壀鍚庡啓鍏モ€濓紝鏄庢樉鏇存帴杩戠湡姝ｅ彲鐢ㄧ殑 AI 瀹℃牳鍙般€?- 涓嬩竴姝ュ彲浠ョ户缁ˉ鈥滆妭鐐瑰啓鍏ュ墠鐨勫畾浣嶉瑙堚€濆拰鈥滅浉浼艰€岄潪鍚屽悕鐨勬蹇垫彁閱掆€濓紝鎶婄‘璁よ川閲忓啀寰€鍓嶆帹涓€姝ャ€?
## 2026-05-31 20:07:20 +08:00 | v0.0.41 | 涓?/ai 鍥捐氨鍙樻洿鑽夌琛ュ樊寮傞瑙堜笌鍗曟潯鍕鹃€夌‘璁?### 浠诲姟鍐呭
- 缁х画鎻愬崌 `/ai` 鐨勭‘璁や綋楠岋紝涓嶅啀鍙敮鎸佲€滄暣鎵瑰啓鍏ュ浘璋扁€濓紝鑰屾槸鍏佽鎸夋潯鍕鹃€夊緟纭鐨勫浘璋卞彉鏇磋崏绋裤€?- 涓?`graph_change` 鑽夌琛ヨ妭鐐?/ 杩炵嚎鐨勫樊寮傞瑙堬紝闄嶄綆纭鍓嶇殑淇℃伅涓嶉€忔槑鎰熴€?### 瀹屾垚缁撴灉
- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛?  - 涓哄浘璋卞彉鏇磋崏绋挎柊澧炲崟鏉″嬀閫夌姸鎬?  - 鏀寔鈥滃叏閫夊綋鍓嶇瓫閫夌粨鏋?/ 娓呯┖閫夋嫨鈥?  - 鍥捐氨纭鍔ㄤ綔鍙彁浜ゅ綋鍓嶉€変腑鐨勮崏绋?  - 涓烘瘡鏉?`graph_change` 鑽夌灞曠ず鍊欓€夎妭鐐瑰垪琛ㄤ笌鍊欓€夎繛绾垮垪琛?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏呭浘璋卞彉鏇撮瑙堛€佸嬀閫夎鍜屽弻鍒楀樊寮傚垪琛ㄧ殑鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- `/ai` 閲岀殑鍥捐氨纭娴佸凡缁忎粠鈥滆兘鎵归噺纭鈥濇彁鍗囧埌鈥滆兘閫愭潯瀹￠槄鍚庣‘璁も€濓紝鏇存帴杩戠湡瀹炵敓浜х幆澧冧笅鐨?AI 瀹℃牳宸ヤ綔鍙般€?- 涓嬩竴姝ュ彲浠ョ户缁ˉ鈥滃浘璋卞彉鏇撮瑙堜腑鐨勮妭鐐圭骇鍕鹃€夆€濆拰鈥滅‘璁ゅ墠鐩爣鍥捐氨鍐茬獊鎻愮ず鈥濓紝璁╃‘璁ょ矑搴﹀啀缁嗕竴灞傘€?
## 2026-05-31 19:28:14 +08:00 | v0.0.40 | 鎶?/ai 琛ユ垚鑽夌绛涢€変笌鍥捐氨鍙樻洿纭宸ヤ綔鍙?### 浠诲姟鍐呭
- 缁х画寮哄寲 `/ai` 宸ヤ綔鍙帮紝琛ヤ笂鎸夋潵婧?/ 鐘舵€佺瓫閫夎崏绋跨殑鑳藉姏锛岃寰呯‘璁ょ粨鏋滀笉鍐嶅彧鑳芥暣鎵规煡鐪嬨€?- 鎶?`note -> graph` 涓?`pdf annotations -> graph` 鐨勫緟纭鍙樻洿鎺ュ叆鍚屼竴濂?`ai_drafts` 鏈哄埗锛屽苟鍏佽鍦?`/ai` 閲岀洿鎺ョ‘璁ゅ啓鍏ョ洰鏍囧浘璋便€?### 瀹屾垚缁撴灉
- 鎵╁睍鍚庣 AI 鑽夌妯″瀷涓庝粨鍌細
  - [backend/internal/modules/ai/dto/ai.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/dto/ai.go)
  - [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)
  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  鐜板湪鏀寔 `metadata` 鎸佷箙鍖栥€佹寜 `draftIds` 璇诲彇鑽夌銆佽褰?`graph_change` 绫诲瀷鑽夌銆?- 鏂板绗旇 / 闃呰鍣ㄧ敓鎴愬浘璋卞彉鏇磋崏绋胯兘鍔涳細
  - [backend/internal/modules/note/service/graph_drafts.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/graph_drafts.go)
  - [backend/internal/modules/reader/service/graph_drafts.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/graph_drafts.go)
  - 鏂版帴鍙ｏ細
    - `POST /api/v1/notes/:id/ai/generate-graph-drafts`
    - `POST /api/v1/materials/:id/reader/annotations/generate-graph-drafts`
- 鏂板鍥捐氨鍙樻洿纭鎺ュ彛 `POST /api/v1/graphs/:id/ai/commit-changes`锛屽苟鍦?[backend/internal/modules/graph/service/helpers.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/helpers.go) 瀹炵幇鑽夌搴旂敤銆佽妭鐐?杩炵嚎 ID 閲嶆槧灏勪笌杩藉姞鍐欏叆銆?- 鏇存柊鍓嶇锛?  - [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts) 澧炲姞鍥捐氨鍙樻洿鐩稿叧鎺ュ彛涓?`AiDraftPayload.metadata`
  - [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 涓殑 `/ai` 椤甸潰鏀寔鏉ユ簮 / 鐘舵€佺瓫閫夈€佸崱鐗囪崏绋垮啓 deck銆佸浘璋卞彉鏇村啓 graph锛涚瑪璁伴〉鍜岄槄璇诲櫒椤典篃琛ヤ簡鈥滅敓鎴愬浘璋卞彉鏇粹€濆叆鍙?  - [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css) 琛ヤ簡 AI 绛涢€夐潰鏉挎牱寮?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- `/ai` 鐜板湪宸茬粡鑳界粺涓€鎵挎帴涓ょ被纭娴侊細`card_draft -> deck/card` 鍜?`graph_change -> graph`锛屾洿鎺ヨ繎 1.0 閲屸€滃彲瀹￠槄銆佸彲纭銆佸彲杩借釜鈥濈殑 AI 宸ヤ綔鍙般€?- 涓嬩竴姝ュ彲浠ョ户缁ˉ涓ゅ潡楂樹环鍊艰兘鍔涳細涓€鏄负鍥捐氨鍙樻洿澧炲姞棰勮宸紓鍜屽崟鏉″嬀閫夌‘璁わ紱浜屾槸鎶?graph -> note / review 鐨勫弽鍚戝缓璁篃鎺ヨ繘鍚屼竴濂楄崏绋挎睜銆?
## 2026-05-31 19:10:23 +08:00 | v0.0.39 | 璁?AI 宸ヤ綔鍙版敮鎸佺洿鎺ョ‘璁よ崏绋垮苟鍐欏叆 deck
### 浠诲姟鍐呭
- 鎶?`/ai` 浠庡彧璇诲巻鍙查〉鎺ㄨ繘鎴愬彲鎵ц宸ヤ綔鍙帮紝璁╁緟纭鑽夌鍙互鐩存帴閫夋嫨鐩爣 deck 骞跺啓鍏ュ涔犵郴缁熴€?- 琛ラ綈鑽夌鏉ユ簮璺宠浆鍜屽鎴风 `draftId` 閫忎紶锛岄伩鍏嶇‘璁ゅ姩浣滀涪澶辫崏绋垮叧鑱斻€?### 瀹屾垚缁撴灉
- 鎵╁睍 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)锛岃 `bulkCreateDeckCards` 鏄庣‘鏀寔 `draftId`锛屼笌鍚庣鑽夌纭閾捐矾瀵归綈銆?- 鏇存柊 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 涓殑 `AiPage`锛?  - 鏂板 deck 鍒楄〃鍔犺浇涓庨粯璁ょ洰鏍囬€夋嫨
  - 鏀寔鎶?`pending` 鑽夌涓€閿啓鍏ュ涔犵郴缁?  - 鍐欏叆鍚庤嚜鍔ㄥ埛鏂?AI 浠诲姟銆佽崏绋垮拰鐢ㄩ噺鎽樿
  - 涓哄浘璋?/ 绗旇 / 闃呰鍣ㄨ崏绋胯ˉ鍏呪€滄墦寮€鏉ユ簮宸ヤ綔鍙扳€濊烦杞?- 鏇存柊 [frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)锛岃ˉ鍏?AI 宸ヤ綔鍙扮‘璁ら潰鏉跨殑甯冨眬鏍峰紡銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm --workspace frontend-user run build`
### 鍚庣画褰卞搷
- `/ai` 鐜板湪宸茬粡浠庘€滅湅缁撴灉鈥濊繘鍏モ€滃鐞嗙粨鏋溾€濋樁娈碉紝寰呯‘璁よ崏绋垮彲浠ョ洿鎺ヨ惤鍒?deck锛宍Phase 7 -> Phase 6` 鐨勫崗鍚屾洿椤轰簡銆?- 涓嬩竴姝ュ彲浠ョ户缁仛涓や欢楂樹环鍊间簨鎯咃細涓€鏄敮鎸佸湪 `/ai` 閲屾寜鏉ユ簮銆佺姸鎬佺瓫閫夎崏绋匡紱浜屾槸鎶?`note/pdf -> graph` 鐨勫緟纭鍙樻洿涔熷苟鍏ュ悓涓€濂?AI 宸ヤ綔鍙般€?
## 2026-05-31 16:48:56 +08:00 | v0.0.38 | 鎸佷箙鍖?AI 寰呯‘璁よ崏绋垮苟鎵撻€氱‘璁ゅ悗鐘舵€佸洖鍐?### 浠诲姟鍐呭
- 鎶婁笂涓€杞殑 AI 浠诲姟璁板綍缁х画鎺ㄨ繘鍒?`ai_drafts` 鎸佷箙鍖栵紝璁╄崏绋跨粨鏋滅湡姝ｅ彲鍥炵湅锛岃€屼笉鏄彧鐣欎笅浠诲姟澹炽€?- 璁╄崏绋垮湪鍐欏叆 deck 鍚庡洖鍐欎负宸茬‘璁ょ姸鎬侊紝閬垮厤 AI 宸ヤ綔鍙版案杩滃爢绉棫鑽夌銆?### 瀹屾垚缁撴灉
- 鏂板 Mongo 鑽夌浠撳偍 [backend/internal/modules/ai/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/document_repository.go)锛屽皢 AI 鍗＄墖鑽夌鎸夊崟鏉℃枃妗ｅ啓鍏?`ai_drafts`銆?- 鎵╁睍 [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)锛屾柊澧烇細
  - `ListDrafts`
  - `RecordNoteCardDrafts`
  - `RecordReaderCardDrafts`
  - `RecordGraphCardDrafts`
  - `ConfirmDrafts`
- 鏂板鎺ュ彛锛?  - `GET /api/v1/ai/drafts`
- 鎵╁睍鍥捐氨銆佺瑪璁般€丳DF 鎵规敞鑽夌鐢熸垚閾捐矾锛岃繑鍥炲彲杩借釜鐨?`draftId`锛涘搴旂‘璁ゅ啓鍗℃椂锛岄€氳繃 [backend/internal/modules/card/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/card/service/service.go) 灏嗚崏绋挎爣璁颁负 `confirmed`銆?- 鍓嶅彴 AI 宸ヤ綔鍙拌ˉ涓娾€滄渶杩?AI 鑽夌鈥濋潰鏉匡紝骞跺睍绀哄緟纭鏁伴噺銆佽崏绋跨姸鎬佷笌鍐呭棰勮锛涚浉鍏虫敼鍔ㄥ湪 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)銆乕frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)銆乕frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)銆?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- AI 宸ヤ綔鍙扮幇鍦ㄥ凡缁忎笉鍙槸鈥滀换鍔℃棩蹇椻€濓紝鑰屾槸寮€濮嬪叿澶囩湡姝ｇ殑寰呯‘璁ょ粨鏋滄睜锛岀鍚堣璁¤鏄庝功閲?`ai_drafts` 鐨勮惤鍦版柟鍚戙€?- 涓嬩竴姝ュ彲浠ョ户缁仛涓や欢楂樹环鍊间簨鎯咃細涓€鏄妸 `/ai` 涓婄殑鑽夌缁撴灉鐩存帴璺宠浆鍥炴潵婧愰〉闈㈡垨纭鐩爣锛屼簩鏄妸 `note/pdf -> graph` 鐨勫緟纭鍙樻洿娴佸仛鎴愬悓涓€濂楁寔涔呭寲鏈哄埗銆?
## 2026-05-31 14:04:55 +08:00 | v0.0.37 | 鎺ュ叆 AI 浠诲姟涓庣敤閲忚拷韪苟钀藉湴 AI 鍘嗗彶椤?### 浠诲姟鍐呭
- 琛ラ綈 `Phase 7` 涓綋鍓嶆渶缂虹殑 `ai_tasks / ai_usage_logs` 杩借釜鑳藉姏锛岃鍥捐氨銆佺瑪璁般€丳DF 鎵规敞鐢熸垚鑽夌鏃剁暀涓嬩换鍔¤褰曚笌鐘舵€併€?- 鎶婂墠鍙?`/ai` 浠庡崰浣嶉〉鍗囩骇涓虹湡瀹炵殑 AI 鍘嗗彶涓庣敤閲忓伐浣滃彴銆?### 瀹屾垚缁撴灉
- 鏂板鍚庣 AI 妯″潡锛?  - [backend/internal/modules/ai/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/service/service.go)
  - [backend/internal/modules/ai/repository/repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/repository/repository.go)
  - [backend/internal/modules/ai/handler/handler.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/handler/handler.go)
  - [backend/internal/modules/ai/router/router.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/ai/router/router.go)
- 鏂板鎺ュ彛锛?  - `GET /api/v1/ai/tasks`
  - `GET /api/v1/ai/usage`
- 鍦?[backend/internal/modules/graph/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/graph/service/service.go)銆乕backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go)銆乕backend/internal/modules/reader/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/service.go) 鎺ュ叆鑽夌鐢熸垚浠诲姟璁板綍锛屾垚鍔?澶辫触閮戒細鐣欎笅鍙拷韪姸鎬併€?- 鍓嶇 AI 椤靛崌绾т负鐪熷疄椤甸潰锛屼綅浜?[frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx)锛涘鎴风鎺ュ彛琛ュ湪 [frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)锛屾牱寮忚ˉ鍦?[frontend-user/src/styles.css](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/styles.css)銆?- 宸查噸鍚湰鍦板墠鍚庣鏈嶅姟锛屼娇 `http://localhost:8001/ai` 鍜?`http://localhost:8023/api/v1/ai/tasks` 鎸囧悜鏈€鏂颁唬鐮併€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- AI 鑽夌鐢熸垚宸茬粡寮€濮嬪叿澶団€滀换鍔″巻鍙层€佺姸鎬併€佹潵婧愩€佺敤閲忊€濈殑鍙洖鐪嬭兘鍔涳紝鍚庣画琛?`ai_quota_logs`銆佸け璐ラ噸璇曞拰鍚庡彴 AI 浠诲姟鐩戞帶浼氶『寰楀銆?- 涓嬩竴姝ュ彲浠ョ户缁妸 `AI 寰呯‘璁ょ粨鏋渀 浠庝粎璁板綍浠诲姟鎺ㄨ繘鍒扮湡姝ｆ寔涔呭寲鑽夌鍐呭锛屼緥濡?`ai_drafts` 涓?`note/pdf -> graph` 鐨勫緟纭鍙樻洿娴併€?
## 2026-05-31 13:38:23 +08:00 | v0.0.36 | 鎺ュ叆绗旇 / PDF 鎵规敞鍒板涔犺崏绋块摼璺苟瑙勮寖 PROJECT_LOG 缁存姢
### 浠诲姟鍐呭
- 琛ラ綈 `note -> card drafts -> deck` 鍜?`reader annotations -> card drafts -> deck` 鐨勫悗绔帴鍙ｄ笌鍓嶇浜や簰銆?- 鎶?`PROJECT_LOG.md` 绾冲叆姣忔杩唬鐨勫父瑙勬洿鏂版竻鍗曪紝骞惰ˉ褰曡繎鍑犺疆鐗堟湰杩涘睍銆?### 瀹屾垚缁撴灉
- 鏂板鍚庣鎺ュ彛锛?  - `POST /api/v1/notes/:id/ai/generate-cards`
  - `POST /api/v1/materials/:id/reader/annotations/generate-cards`
  - `POST /api/v1/decks/:id/cards/bulk`
- 鎵╁睍 [backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go) 鍜?[backend/internal/modules/reader/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/reader/service/service.go)锛屾妸绗旇姝ｆ枃銆佹壒娉ㄥ紩鐢ㄦ寮忚浆鎴愬彲缂栬緫鍗＄墖鑽夌銆?- 鎵╁睍 [frontend-user/src/app/App.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/app/App.tsx) 鍜?[frontend-user/src/api/client.ts](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/api/client.ts)锛屽湪绗旇椤点€侀槄璇诲櫒椤垫帴鍏?deck 閫夋嫨銆佽崏绋跨紪杈戙€佺‘璁ゅ啓鍏ヤ氦浜掋€?- 鍦ㄦ湰鏂囨。琛ュ綍 v0.0.34 / v0.0.35 / v0.0.36 鐨勪富瑕佸彉鏇达紝鍚庣画缁х画鎸夊悓鏍锋柟寮忕淮鎶ゃ€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- `Phase 5 -> 6/7` 鐨勫浘璋便€佺瑪璁般€侀槄璇诲櫒銆佸涔犵郴缁熷凡缁忓紑濮嬪叡鐢ㄥ悓涓€濂楀崱鐗囪崏绋跨‘璁ゆ祦绋嬨€?- 鍚庣画鍙互缁х画鎶?`ai_tasks / ai_usage_logs` 鍜?`note/pdf -> graph` 鐨勫弻鍚戦摼璺ˉ鍏ㄥ埌 1.0 鑼冨洿銆?
## 2026-05-31 12:55:00 +08:00 | v0.0.35 | 鎵撻€氬浘璋卞崱鐗囪崏绋跨‘璁ゅ啓鍏?deck
### 浠诲姟鍐呭
- 鎶婂浘璋辨彁鍙栧埌鐨勫涔犺崏绋垮彉鎴愬彲浠ョ洿鎺ョ‘璁ゅ啓鍏?deck 鐨勭湡瀹炴祦绋嬨€?### 瀹屾垚缁撴灉
- 鏂板 `POST /api/v1/graphs/:id/ai/commit-cards`銆?- 鍓嶇鍥捐氨椤垫敮鎸?deck 閫夋嫨銆佽崏绋跨紪杈戙€佷竴閿啓鍏ュ涔犵郴缁熴€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- 涓哄悗缁瑪璁般€丳DF 鎵规敞銆丄I 鑽夌澶嶇敤鍚屼竴鏉″崱鐗囪惤鍦伴摼璺墦濂藉熀纭€銆?
## 2026-05-31 12:10:00 +08:00 | v0.0.34 | 瀹屾垚 deck / card / SM-2 澶嶄範闂幆
### 浠诲姟鍐呭
- 鎶?`Phase 6` 鐨?`deck`銆乣card`銆乣today queue`銆乣review submit` 鍜?`SM-2` 璋冨害鎺ュ埌鐪熷疄鍚庣涓庡墠绔€?### 瀹屾垚缁撴灉
- 鏂板鍚庣 `card` 妯″潡锛屾敮鎸佸崱缁勩€佸崱鐗囧垱寤恒€佷粖鏃ュ埌鏈熼槦鍒椼€佽瘎鍒嗘彁浜ゅ拰 SM-2 璋冨害銆?- 鏂板鍓嶇 [frontend-user/src/modules/review/ReviewWorkspacePage.tsx](/E:/Code/1108026_rust_go/StudyMate/frontend-user/src/modules/review/ReviewWorkspacePage.tsx)锛屾敮鎸佸垱寤?deck銆佹坊鍔犲崱鐗囥€佺炕闈€佹寜 `Again / Hard / Good / Easy` 澶嶄範銆?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm --workspace frontend-user run build`
- `npm --workspace frontend-admin run build`
### 鍚庣画褰卞搷
- 澶嶄範绯荤粺宸茬粡鍙互鎵胯浇鍥捐氨銆佺瑪璁板拰 AI 鑽夌鐢熸垚鐨勫崱鐗囧唴瀹癸紝鎴愪负 1.0 涓殑鐪熷疄涓诲共銆?
## 2026-05-27 14:27:30 +08:00 | v0.0.33 | 鎺ュ叆绗旇鍐呭 Mongo 鍙屽啓骞朵慨澶嶅垹闄ゆ竻鐞嗛摼璺?### 浠诲姟鍐呭
- 鎸夊綋鍓嶉」鐩繘灞曪紝鎶婄瑪璁版鏂囧紑濮嬫帴鍏?MongoDB銆?- 璁?`notes` 鍜?`note_versions` 鍦ㄥ啓鍏?MySQL 鐨勫悓鏃讹紝鍙屽啓鍒?`note_documents` 鍜?`note_snapshots`銆?- 楠岃瘉鍒涘缓銆佹洿鏂般€佸垹闄や笁鏉℃牳蹇冮摼璺紝骞朵慨澶嶈繃绋嬩腑鍙戠幇鐨勬暟鎹畫鐣欓棶棰樸€?### 瀹屾垚缁撴灉
- 鏂板 [backend/internal/modules/note/repository/document_repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/document_repository.go)锛屽疄鐜帮細
  - `note_documents` 褰撳墠鏂囨。 upsert
  - `note_snapshots` 鐗堟湰蹇収 upsert
  - 鍒犻櫎绗旇鏃剁殑 Mongo 鏂囨。娓呯悊
  - HTML 鍒?`plain_text` 鐨勬彁鍙栦笌鍗曞潡缁撴瀯灏佽
- 鏂板 [backend/internal/modules/note/repository/document_repository_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/document_repository_test.go)锛岃鐩栫函鏂囨湰鎻愬彇鍜屾枃妗ｆ瀯寤恒€?- 鏇存柊 [backend/internal/modules/note/service/service.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/service/service.go)锛屽湪鍒涘缓銆佹洿鏂般€佹仮澶嶇増鏈€佸垹闄ょ瑪璁版椂鎺ュ叆 Mongo 鍙屽啓鍜屾竻鐞嗐€?- 鏇存柊 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)锛屼负 `note` 妯″潡娉ㄥ叆 Mongo 鏂囨。浠撳偍銆?- 鏇存柊 [backend/internal/modules/note/repository/repository.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/modules/note/repository/repository.go)锛岃ˉ鍏呭垹闄?`note_versions / note_relations` 鐨勮兘鍔涖€?- 鏇存柊 Mongo 鍒濆鍖栬剼鏈?[backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js)锛屼慨澶嶅揩鐓у敮涓€绱㈠紩瀛楁鍚嶉敊璇紝骞舵敮鎸佽嚜鍔ㄩ噸寤哄悓鍚嶆棫绱㈠紩銆?- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)銆乕docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)銆乕docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)锛屽悓姝ュ綋鍓嶅疄鐜扮姸鎬併€?### 楠岃瘉缁撴灉
- `go test ./...` 閫氳繃銆?- 鐪熷疄鎺ュ彛鑱旇皟閫氳繃锛?  - 娉ㄥ唽涓存椂鐢ㄦ埛
  - 鍒涘缓绗旇鍚?`note_documents = 1`锛宍note_snapshots = 1`
  - 鏇存柊绗旇鍚?`note_documents.version = 2`锛宍note_snapshots = 2`
  - 鍒犻櫎绗旇鍚?Mongo 涓?`note_documents = 0`銆乣note_snapshots = 0`
  - 鍒犻櫎绗旇鍚?MySQL 涓?`notes = 0`銆乣note_versions = 0`銆乣note_relations = 0`
- 宸蹭慨澶?`note_snapshots` 绱㈠紩瀛楁鍚嶄粠 `version_number` 鍒?`version` 鐨勪笉涓€鑷撮棶棰橈紝骞跺湪鐜版湁 `studymate_content` 涓婇噸寤烘垚鍔熴€?- 宸叉竻鐞嗘湰杞皟璇曠敓鎴愮殑涓存椂娈嬬暀绗旇鍜?Mongo 鏂囨。銆?### 鍚庣画褰卞搷
- 绗旇妯″潡宸茬粡杩涘叆鈥滀富璁板綍鍦?MySQL銆佸唴瀹规枃妗ｅ湪 Mongo 鍙屽啓鈥濈殑鐘舵€併€?- 涓嬩竴姝ュ彲浠ョ户缁妸璇诲彇閾捐矾閫愭鍒囨崲鍒?Mongo锛屾垨鑰呭紑濮嬫妸闃呰鎵规敞涔熸帴鍏?`pdf_annotation_documents`銆?
## 2026-05-27 13:34:10 +08:00 | v0.0.32 | 娓呯悊 Mongo 涓存椂 test 搴?### 浠诲姟鍐呭
- 鍒犻櫎 MongoDB 涓笉鍐嶉渶瑕佺殑涓存椂 `test` 鏁版嵁搴撱€?- 淇濈暀 MongoDB 绯荤粺搴撳拰椤圭洰涓氬姟搴撱€?### 瀹屾垚缁撴灉
- 宸插垹闄?Mongo `test` 搴撱€?- 褰撳墠 Mongo 鏁版嵁搴撳垪琛ㄤ负锛?  - `admin`
  - `config`
  - `local`
  - `studymate_content`
### 楠岃瘉缁撴灉
- `dropDatabase()` 杩斿洖鎴愬姛銆?- 閲嶆柊璇诲彇鏁版嵁搴撳垪琛ㄥ悗锛宍test` 宸蹭笉瀛樺湪銆?### 鍚庣画褰卞搷
- 褰撳墠 Mongo 鐜鏇存帴杩戦」鐩寮忎娇鐢ㄧ姸鎬併€?- `admin`銆乣config`銆乣local` 涓虹郴缁熷簱锛屽悗缁棤闇€澶勭悊銆?
## 2026-05-27 13:28:20 +08:00 | v0.0.31 | 鍒濆鍖栨湰鏈?Mongo 涓氬姟搴?studymate_content
### 浠诲姟鍐呭
- 灏嗘湰鏈?MongoDB 涓殑 `studymate_content` 涓氬姟搴撴寜椤圭洰鑴氭湰鍒濆鍖栧畬鎴愩€?- 楠岃瘉闆嗗悎涓庡叧閿储寮曟槸鍚︾湡瀹炶惤搴擄紝鑰屼笉鏄粎鑴氭湰鎵撳嵃鎴愬姛銆?### 瀹屾垚缁撴灉
- 鎵ц [backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js) 鎴愬姛銆?- `studymate_content` 褰撳墠宸插垱寤洪泦鍚堬細
  - `ai_conversations`
  - `ai_drafts`
  - `diagram_source_documents`
  - `graph_documents`
  - `graph_snapshots`
  - `material_text_documents`
  - `note_documents`
  - `note_snapshots`
  - `pdf_annotation_documents`
  - `user_workspace_states`
- 宸茬‘璁ゅ叧閿储寮曞瓨鍦細
  - `note_documents.uk_note_documents_note_id`
  - `note_documents.idx_note_documents_owner_updated_at`
  - `note_documents.idx_note_documents_material_updated_at`
  - `user_workspace_states.uk_user_workspace_states_user_workspace`
  - `user_workspace_states.idx_user_workspace_states_updated_at`
### 楠岃瘉缁撴灉
- `studymate_content` 宸插嚭鐜板湪 Mongo 鏁版嵁搴撳垪琛ㄤ腑銆?- 闆嗗悎鍒楄〃涓庣储寮曟煡璇㈠潎杩斿洖鎴愬姛銆?### 鍚庣画褰卞搷
- 鍚庣画鍙互寮€濮嬫妸绗旇姝ｆ枃銆佸揩鐓с€佸浘璋辨枃妗ｇ瓑鍐呭閫愭杩佺Щ鍒?MongoDB銆?
## 2026-05-27 13:22:40 +08:00 | v0.0.30 | 楠岃瘉鎵嬪姩鎵ц鐨?MySQL 杩佺Щ骞惰ˉ榻?Mongo 鍒濆鍖栬剼鏈?### 浠诲姟鍐呭
- 妫€鏌?`studymate` 涓墜鍔ㄦ墽琛岀殑 `001/002/003` MySQL 鑴氭湰鏄惁鎴愬姛钀藉簱銆?- 纭褰撳墠鍚庣鍙户缁甯镐娇鐢ㄨ鏁版嵁搴撱€?- 鍦ㄤ笅涓€姝ュ伐浣滀腑琛ラ綈 MongoDB 鍐呭搴撳垵濮嬪寲涓庡洖婊氳剼鏈紝骞跺仛瀹炶窇楠岃瘉銆?### 瀹屾垚缁撴灉
- 宸查獙璇?`studymate` 涓瓨鍦ㄨ縼绉昏褰曪細
  - `001_init_schema.sql`
  - `002_seed_baseline.sql`
  - `003_align_current_tables.sql`
- 宸茬‘璁ゅ叧閿瓧娈靛拰绱㈠紩瀛樺湪锛屽寘鎷細
  - `users.status`
  - `file_records.storage_provider`
  - `posts.summary`
  - `comments.parent_comment_id`
  - `idx_notes_owner_updated_at`
  - `idx_posts_status_created_at`
  - `idx_comments_post_status_created_at`
  - `idx_pdf_annotations_user_material_updated_at`
- 宸茬‘璁ゅ熀纭€绉嶅瓙鏁版嵁瀛樺湪锛?  - `roles = 3`
  - `permissions = 12`
  - `role_permissions = 25`
  - `system_configs = 5`
- 鏂板 Mongo 鍒濆鍖栬剼鏈細
  - [backend/internal/migrations/mongo/001_init_content_collections.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.js)
  - [backend/internal/migrations/mongo/001_init_content_collections.down.js](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mongo/001_init_content_collections.down.js)
- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)銆乕docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)銆乕docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)锛岃ˉ鍏?Mongo 杩佺Щ浣跨敤鏂瑰紡銆?### 楠岃瘉缁撴灉
- `go run ./cmd/migrate` 鍦ㄤ富搴?`studymate` 涓婃墽琛屾垚鍔熴€?- 鍚庣浣跨敤 `studymate` 鍚姩鍚庯紝`http://localhost:8126/health` 杩斿洖鎴愬姛锛屼緷璧栫姸鎬佹甯搞€?- Mongo 涓存椂搴?`studymate_content_check` 宸插畬鎴愶細
  - `001_init_content_collections.js` 鎵ц鎴愬姛
  - 闆嗗悎涓庣储寮曟鏌ユ垚鍔?  - `001_init_content_collections.down.js` 鎵ц鎴愬姛
  - 鍥炴粴鍚庨泦鍚堟竻绌猴紝涓存椂搴撳凡鍒犻櫎
### 鍚庣画褰卞搷
- 褰撳墠 MySQL 鎵嬪姩杩佺Щ缁撴灉娌℃湁鍙戠幇闃诲鎬ч棶棰橈紝鍙互缁х画鍦ㄨ繖濂楀簱涓婂紑鍙戙€?- 椤圭洰宸茬粡鍏峰 Mongo 鍐呭搴撶殑鍒濆鍖栧拰鍥炴粴鑴氭湰锛屼负鍚庣画鎶婄瑪璁?鍥捐氨鍐呭閫愭杩佺Щ鍒?Mongo 濂犲畾浜嗗熀纭€銆?
## 2026-05-27 13:10:20 +08:00 | v0.0.29 | 琛ラ綈 MySQL 杩佺Щ down SQL 骞堕獙璇佸洖婊氶摼璺?### 浠诲姟鍐呭
- 鍦ㄧ幇鏈?MySQL 杩佺Щ浣撶郴涓婅ˉ榻愬搴旂殑 down SQL 鏂囦欢銆?- 閬垮厤 `.down.sql` 琚悗绔嚜鍔ㄨ縼绉婚€昏緫璇墽琛屻€?- 楠岃瘉 `up -> down` 鍥炴粴閾捐矾鍦ㄤ复鏃舵暟鎹簱涓彲杩愯銆?### 瀹屾垚缁撴灉
- 鏇存柊 [backend/internal/migrations/mysql/migrator.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator.go)锛岃嚜鍔ㄨ縼绉荤幇鍦ㄤ細蹇界暐 `.down.sql` 鏂囦欢銆?- 鏇存柊 [backend/internal/migrations/mysql/migrator_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator_test.go)锛屾柊澧炲拷鐣ュ洖婊氭枃浠舵祴璇曘€?- 鏂板鍥炴粴鏂囦欢锛?  - [001_init_schema.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/001_init_schema.down.sql)
  - [002_seed_baseline.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/002_seed_baseline.down.sql)
  - [003_align_current_tables.down.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/003_align_current_tables.down.sql)
- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)銆乕docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)銆乕docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)锛岃ˉ鍏?up/down 璇存槑銆?- 灏嗕富搴?`studymate` 杩佺Щ鍒?`003`锛岀‘璁ゅ綋鍓嶆湰鍦版暟鎹簱宸茬粡涓庝粨搴撹縼绉荤増鏈榻愩€?### 楠岃瘉缁撴灉
- `go test ./...` 閫氳繃銆?- 鍦ㄤ复鏃跺簱 `studymate_rollback_check` 涓墽琛屽畬鏁撮獙璇侊細
  - `go run ./cmd/migrate` 鎴愬姛搴旂敤 `001`銆乣002`銆乣003`
  - 鎵嬪姩鎵ц `003_align_current_tables.down.sql` 鎴愬姛
  - 鎵嬪姩鎵ц `002_seed_baseline.down.sql` 鎴愬姛
  - 鎵嬪姩鎵ц `001_init_schema.down.sql` 鎴愬姛
  - 鍥炴粴鍚庝复鏃跺簱琛ㄧ粨鏋勫凡娓呯┖
- 涓诲簱 `studymate` 宸茬‘璁ゅ瓨鍦?`003` 杩佺Щ璁板綍锛屼笖 `users.status`銆乣idx_notes_owner_updated_at` 绛?`003` 瀵归綈缁撴灉宸茬敓鏁堛€?### 鍚庣画褰卞搷
- 椤圭洰鐜板湪鍚屾椂鍏峰 up/down SQL 鏂囦欢锛屽彲鏀寔鏇磋鑼冪殑鏁版嵁搴撳彉鏇翠氦浠樸€?- 鍚庣画鏂板杩佺Щ寤鸿缁х画鎴愬琛ラ綈 `004_xxx.sql` 鍜?`004_xxx.down.sql`銆?
## 2026-05-27 12:36:30 +08:00 | v0.0.28 | 鏂板 002 澧為噺杩佺Щ骞堕獙璇佺┖搴撹縼绉诲吋瀹规€?### 浠诲姟鍐呭
- 鍦ㄥ凡鎺ュ叆鐨?MySQL 杩佺Щ浣撶郴涓婄户缁ˉ鍏呭閲忚縼绉汇€?- 涓烘渶缁堣璁￠鐣欑殑 RBAC 鍜岀郴缁熼厤缃綋绯诲姞鍏ュ熀纭€绉嶅瓙鏁版嵁銆?- 楠岃瘉鈥滅┖搴撳彧闈犺縼绉昏剼鏈缓璧锋潵鍚庯紝鍚庣鍙洿鎺ュ惎鍔ㄢ€濄€?### 瀹屾垚缁撴灉
- 鏂板 [backend/internal/migrations/mysql/002_seed_baseline.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/002_seed_baseline.sql)銆?- 璇ヨ縼绉昏剼鏈寘鍚細
  - 3 涓熀纭€瑙掕壊锛歚admin`銆乣moderator`銆乣user`
  - 12 涓熀纭€鏉冮檺
  - 25 鏉¤鑹叉潈闄愭槧灏?  - 5 鏉＄郴缁熼厤缃瀛愭暟鎹?- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md)銆乕docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)銆乕docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)锛岃ˉ鍏呭鏂囦欢杩佺Щ鍜岀瀛愭暟鎹鏄庛€?- 鏂板缓涓存椂绌哄簱 `studymate_migration_check` 鍋氫粠闆惰縼绉婚獙鏀讹紝楠岃瘉缁撴潫鍚庡凡鍒犻櫎锛屼繚鎸佹湰鍦扮幆澧冩暣娲併€?### 楠岃瘉缁撴灉
- `go test ./...` 閫氳繃銆?- 褰撳墠涓诲簱 `studymate` 鎵ц `go run ./cmd/migrate` 鎴愬姛銆?- 涓存椂绌哄簱鎵ц `go run ./cmd/migrate` 鎴愬姛銆?- 宸茬‘璁?`schema_migrations` 涓瓨鍦ㄧ増鏈?`001`銆乣002`銆?- 宸茬‘璁ゅ熀纭€绉嶅瓙鏁版嵁鏁伴噺姝ｇ‘锛?  - `roles = 3`
  - `permissions = 12`
  - `role_permissions = 25`
  - `system_configs = 5`
- 浣跨敤涓存椂绌哄簱鍚姩鍚庣鏈嶅姟锛屽仴搴锋鏌ヨ繑鍥炴垚鍔熴€?### 鍚庣画褰卞搷
- 鍚庣画鏉冮檺浣撶郴銆佺鐞嗗悗鍙版不鐞嗚兘鍔涘拰鍔熻兘寮€鍏抽厤缃凡缁忔湁缁熶竴鏁版嵁钀界偣銆?- 鍚庣画鏂板琛ㄧ粨鏋勬垨绉嶅瓙鏁版嵁鏃讹紝鍙户缁寜 `003_xxx.sql`銆乣004_xxx.sql` 鐨勬柟寮忓閲忔墿灞曘€?
## 2026-05-27 12:26:40 +08:00 | v0.0.27 | 鎺ュ叆 MySQL 杩佺Щ鎵ц鍣ㄥ苟鏇挎崲鍚庣 AutoMigrate
### 浠诲姟鍐呭
- 鎶婂凡瀹屾垚鐨?MySQL 鍒濆鍖?SQL 鑴氭湰鎺ュ叆鍚庣杩愯閾捐矾銆?- 璁╅」鐩棦鏀寔鏈嶅姟鍚姩鑷姩杩佺Щ锛屼篃鏀寔鍗曠嫭鎵ц杩佺Щ鍛戒护銆?- 绉婚櫎涓庣粺涓€ SQL 杩佺Щ浣撶郴鍐茬獊鐨?GORM `AutoMigrate` 鍚姩閫昏緫銆?### 瀹屾垚缁撴灉
- 鏂板 [backend/internal/migrations/mysql/migrator.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator.go)锛屽疄鐜帮細
  - 鍐呭祵 `*.sql` 杩佺Щ鏂囦欢銆?  - 杩佺Щ鏂囦欢鎸夊悕绉版帓搴忔墽琛屻€?  - SQL 璇彞鎷嗗垎銆佹敞閲婅烦杩囥€乣USE` 璇彞蹇界暐銆?- 鏂板 [backend/internal/migrations/mysql/migrator_test.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/migrator_test.go)锛岃鐩?SQL 璇彞鎷嗗垎鍜屽唴宓岃縼绉诲彂鐜伴€昏緫銆?- 鏇存柊 [backend/internal/app/server.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/app/server.go)锛屾湇鍔″惎鍔ㄦ敼涓烘墽琛?MySQL 杩佺Щ锛屼笉鍐嶈皟鐢?GORM `AutoMigrate`銆?- 鏇存柊 [backend/internal/pkg/database/database.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/pkg/database/database.go)锛屽鍑轰富鏁版嵁搴撹繛鎺ユ柟娉曚緵杩佺Щ鍛戒护澶嶇敤銆?- 鏂板 [backend/cmd/migrate/main.go](/E:/Code/1108026_rust_go/StudyMate/backend/cmd/migrate/main.go)锛屾敮鎸佸崟鐙墽琛岋細
  - `cd backend`
  - `go run ./cmd/migrate`
- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md) 鍜?[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)锛岃ˉ鍏呰縼绉昏鏄庛€?### 楠岃瘉缁撴灉
- `go test ./...` 閫氳繃銆?- `go run ./cmd/migrate` 鎵ц鎴愬姛銆?- 浣跨敤涓存椂绔彛 `8123` 鍚姩鍚庣锛屽仴搴锋鏌ヨ繑鍥炴垚鍔燂紝渚濊禆鐘舵€佷负 `sql=up`銆乣redis=up`銆乣mongo=up`銆乣mode=mysql`銆?### 鍚庣画褰卞搷
- 鍚庣鏁版嵁搴撳垵濮嬪寲宸茬粡缁熶竴鍒囨崲鍒?SQL 杩佺Щ浣撶郴銆?- 鍚庣画琛ㄧ粨鏋勫崌绾у缓璁柊澧?`002_xxx.sql`銆乣003_xxx.sql` 绛夊閲忚剼鏈紝涓嶅啀渚濊禆 GORM 鑷姩寤鸿〃銆?
## 2026-05-27 00:29:30 +08:00 | v0.0.26 | 鐢熸垚骞堕獙璇?MySQL 鍒濆骞傜瓑 SQL 鑴氭湰
### 浠诲姟鍐呭
- 鏍规嵁鏈€缁堝鍚戞暟鎹簱璁捐锛岃緭鍑哄彲鐩存帴鎵ц鐨?MySQL 鍒濆鍖?SQL 鏂囦欢銆?- 鍏奸【褰撳墠宸插紑鍙戞ā鍧椾笌鍚庣画鍥捐氨銆佸崱鐗囥€丄I銆佸伐绋嬪浘绛夋墿灞曟ā鍧椼€?- 鍦ㄦ湰鏈哄凡鍒涘缓鐨?`studymate` 鏁版嵁搴撲笂瀹為檯鎵ц锛岄獙璇佽剼鏈畬鏁存€т笌骞傜瓑鎬с€?### 瀹屾垚缁撴灉
- 鏂板 [backend/internal/migrations/mysql/001_init_schema.sql](/E:/Code/1108026_rust_go/StudyMate/backend/internal/migrations/mysql/001_init_schema.sql)銆?- 鑴氭湰鍖呭惈锛?  - `schema_migrations` 杩佺Щ璁板綍琛ㄣ€?  - 褰撳墠宸插疄鐜版ā鍧楀搴旇〃锛氱敤鎴枫€佽璇併€佹枃浠躲€佽祫鏂欍€佺ぞ鍖恒€侀槄璇汇€佺瑪璁般€佸璁°€?  - 鏈€缁堣璁￠鐣欐墿灞曡〃锛氬洟闃熴€佽瘽棰樸€佷妇鎶ャ€佸悎闆嗐€佸浘璋便€佸伐绋嬪浘銆佸崱鐗囥€丄I銆佽绋嬨€佹悳绱€佽繍钀ラ厤缃瓑銆?  - 缁熶竴瀛楃闆?`utf8mb4`銆佹绉掔骇鏃堕棿瀛楁銆佸敮涓€绾︽潫銆佺粍鍚堢储寮曘€佸繀瑕佹鏌ョ害鏉熴€?- 鏇存柊 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)锛岃ˉ鍏?SQL 钀藉湴鏂囦欢鍏ュ彛鍜岃剼鏈畾浣嶈鏄庛€?### 楠岃瘉缁撴灉
- 宸叉鏌?SQL 鏂囦欢瀹屾暣鎬э紝鏂囦欢鍏?`978` 琛岋紝灏鹃儴杩佺Щ璁板綍鎻掑叆璇彞闂悎姝ｅ父銆?- 浣跨敤鏈満 MySQL 8.0 瀵?`studymate` 鎵ц鑴氭湰涓ゆ锛屽潎鎴愬姛锛屾棤閲嶅寤鸿〃閿欒銆?- 鎵ц鍚庢暟鎹簱琛ㄦ暟閲忎负 `65` 寮犮€?- 宸茬‘璁ゅ叧閿墿灞曡〃鍒涘缓鎴愬姛锛歚graphs`銆乣cards`銆乣ai_tasks`銆乣diagram_sources`銆乣document_chunks`銆?- 宸茬‘璁?`schema_migrations` 涓粎瀛樺湪鐗堟湰 `001` 璁板綍銆?### 鍚庣画褰卞搷
- 褰撳墠鍒濆鍖栬剼鏈凡鍙綔涓洪」鐩?MySQL 鐨勭粺涓€璧风偣銆?- 鍚庣画鑻ュ嚭鐜扮粨鏋勫樊寮傝皟鏁达紝搴旇拷鍔?`002_xxx.sql` 涔嬬被澧為噺杩佺Щ锛岃€屼笉鏄洿鎺ヨ鍐欏垵濮嬪寲鑴氭湰鎵挎媴鎵€鏈夊崌绾ч€昏緫銆?
## 2026-05-27 00:00:39 +08:00 | v0.0.25 | 璁捐 MySQL 涓?MongoDB 鏁版嵁搴撶粨鏋?### 浠诲姟鍐呭
- 鏍规嵁銆婂浼撮」鐩細瀵规爣 Project Graph 鐨勫崌绾ц璁°€嬫暣鐞嗘渶缁堝鍚戠殑鏁版嵁搴撶粨鏋勩€?- 缁撳悎褰撳墠宸插疄鐜扮殑鐢ㄦ埛銆佽祫鏂欍€佺ぞ鍖恒€侀槄璇汇€佺瑪璁版ā鍧楋紝璁捐鍙€愭钀藉湴鐨?MySQL 涓?MongoDB 鍒嗗伐銆?- 灏嗘暟鎹簱璁捐鏀惧叆鍙彁浜ょ殑椤圭洰鏋舵瀯鏂囨。鐩綍銆?### 瀹屾垚缁撴灉
- 鏂板 [docs/architecture/DATABASE_DESIGN.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/DATABASE_DESIGN.md)銆?- 鏂囨。瑕嗙洊锛?  - MySQL 涓?MongoDB 鐨勮亴璐ｈ竟鐣屻€?  - 褰撳墠闃舵 MySQL 琛ㄧ粨鏋勩€?  - 鏈€缁堢洰鏍囨墿灞曡〃缁撴瀯銆?  - MongoDB 鍐呭闆嗗悎缁撴瀯銆?  - 绗旇銆佸浘璋便€丳DF 鎵规敞銆丄I 鑽夌鐨勮法搴撳啓鍏ユ祦绋嬨€?  - 鍒嗛樁娈佃惤鍦拌矾绾裤€?- 鏇存柊 [docs/architecture/ARCHITECTURE.md](/E:/Code/1108026_rust_go/StudyMate/docs/architecture/ARCHITECTURE.md)锛屽鍔犳暟鎹簱璁捐鏂囨。鍏ュ彛銆?### 楠岃瘉缁撴灉
- 宸茬‘璁ゆ柊鏂囨。浣嶄簬 `docs/architecture/`锛屼笉鍙?`docs/planning/` 鍜?`docs/design/` 蹇界暐瑙勫垯褰卞搷銆?- 鏈浠呮柊澧炴灦鏋勬枃妗ｏ紝鏈敼鍔ㄤ笟鍔′唬鐮侊紝鏈繍琛岀紪璇戞祴璇曘€?### 鍚庣画褰卞搷
- 鍚庣画瀹炵幇 MongoDB 鎺ュ叆銆佸浘璋辨ā鍧椼€佸崱鐗囨ā鍧椼€丄I 妯″潡鏃讹紝鍙寜璇ユ枃妗ｉ€愭鎵╁睍銆?- 涓嬩竴姝ュ缓璁紭鍏堝疄鐜?`note_documents` 涓?`note_snapshots`锛岃绗旇鍐呭浠?HTML 杩囨浮鍒板潡鏂囨。銆?
## 2026-05-26 23:52:45 +08:00 | v0.0.24 | 鎻愪氦褰撳墠鍙氦浠樻敼鍔ㄥ苟鏁寸悊蹇界暐瑙勫垯
### 浠诲姟鍐呭
- 鎸夎姹傛彁浜ゅ綋鍓嶆湭鎻愪氦鐨勫彲浜や粯鍐呭銆?- 鏃ュ織璁板綍鍜屽紑鍙戣鍒掔浉鍏虫枃妗ｄ笉杩涘叆鎻愪氦锛屽苟鍔犲叆蹇界暐鍚嶅崟銆?- `.docx` 鏂囦欢鍙厑璁搁」鐩枃妗ｇ洰褰曚笅鐨勬枃浠惰繘鍏ョ増鏈簱銆?### 瀹屾垚缁撴灉
- 鏂板骞舵彁浜ゅ拷鐣ヨ鍒欙細
  - 蹇界暐 `PROJECT_LOG.md`銆乣docs/planning/`銆乣docs/design/`銆?  - 蹇界暐鏈湴缂撳瓨銆佹瀯寤轰骇鐗┿€乣tsbuildinfo`銆佽繍琛屾湡鏁版嵁搴撴枃浠跺拰鏈湴瑙嗚浜х墿銆?  - 榛樿蹇界暐 `.docx`锛屼絾鍏佽 `docs/**/*.docx` 浣滀负椤圭洰鏂囨。鎻愪氦銆?- 浠庣増鏈储寮曠Щ闄ゅ凡杩借釜鐨勬湰鍦扮紦瀛樸€佹瀯寤轰俊鎭拰杩愯鏈熸暟鎹簱鏂囦欢銆?- 淇濈暀鏈湴 `PROJECT_LOG.md`锛屼絾鏈皢鏃ュ織鍐呭绾冲叆鎻愪氦銆?- 鍒涘缓鎻愪氦 `060c109 feat: 瀹炵幇闃呰绗旇闂幆骞剁粺涓€ MySQL 閰嶇疆`銆?### 楠岃瘉缁撴灉
- `go test ./...` 閫氳繃銆?- `npm run typecheck` 閫氳繃銆?- `npm run build:user` 閫氳繃銆?- `npm run build:admin` 閫氳繃銆?- 鎻愪氦鍓嶆鏌ョ‘璁?`PROJECT_LOG.md`銆乣docs/planning/`銆乣docs/design/`銆乣.env` 鍜?`.docx` 鏈繘鍏ユ彁浜ゅ唴瀹广€?### 鍚庣画褰卞搷
- 鍚庣画鎻愪氦榛樿涓嶄細鍐嶆贩鍏ユ棩蹇椼€佽鍒掕崏绋裤€佹湰鍦扮紦瀛樺拰杩愯鏈熸枃浠躲€?- 褰撳墠宸ヤ綔鍖洪櫎蹇界暐椤瑰宸茬粡骞插噣銆?
## 2026-05-26 23:41:56 +08:00 | v0.0.23 | 瀹屽叏绉婚櫎鏃ф湰鍦板崟鏂囦欢鏁版嵁搴撴柟妗堬紝鏁版嵁搴撳眰缁熶竴涓?MySQL
### 浠诲姟鍐呭
- 鎸夎璁¤鏄庢墽琛屾暟鎹簱鏂规锛屼笉鍐嶄繚鐣欐棫鏈湴鍗曟枃浠舵暟鎹簱閰嶇疆銆侀┍鍔ㄥ垎鏀垨渚濊禆銆?- 鍚庣缁熶竴浣跨敤 MySQL锛岃处鍙?`root`锛屽瘑鐮?`123456`锛屾暟鎹簱 `studymate`銆?- 鍚屾鐜鏂囦欢銆佸紑鍙戣鏄庛€丷EADME 鍜岄」鐩褰曘€?### 瀹屾垚缁撴灉
- 鏇存柊 [backend/internal/config/config.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/config/config.go)锛岀Щ闄ゆ棫璺緞閰嶇疆锛屼粎淇濈暀 MySQL 鏁版嵁婧愰厤缃€?- 鏇存柊 [backend/internal/pkg/database/database.go](/E:/Code/1108026_rust_go/StudyMate/backend/internal/pkg/database/database.go)锛屽垹闄ゆ棫椹卞姩瀵煎叆鍜岃繛鎺ュ垎鏀紝鍚庣鍙帴鍙?`DB_DRIVER=mysql`銆?- 鏇存柊 [.env](/E:/Code/1108026_rust_go/StudyMate/.env) 鍜?[.env.example](/E:/Code/1108026_rust_go/StudyMate/.env.example)锛屽垹闄ゆ棫璺緞鍙橀噺锛岄粯璁?`MYSQL_DSN` 鎸囧悜鏈湴 MySQL銆?- 鏇存柊 [README.md](/E:/Code/1108026_rust_go/StudyMate/README.md) 鍜?[docs/DEVELOPMENT.md](/E:/Code/1108026_rust_go/StudyMate/docs/DEVELOPMENT.md)锛岀Щ闄ゆ棫鏁版嵁搴撳洖閫€璇存槑銆?- 鎵ц `go mod tidy`锛屾竻鐞嗘棫鏈湴鍗曟枃浠舵暟鎹簱鐩稿叧渚濊禆銆?- 鍋滄浠嶅崰鐢ㄦ棫鏁版嵁搴撴枃浠剁殑鍘嗗彶鍚庣杩涚▼锛屽垹闄?[storage/studymate.db](/E:/Code/1108026_rust_go/StudyMate/storage/studymate.db)銆?- 浣跨敤 MySQL 閰嶇疆閲嶆柊鍚姩 `8023` 鍚庣鏈嶅姟銆?### 楠岃瘉缁撴灉
- 鍏ㄥ眬妫€绱㈡棫鏁版嵁搴撳叧閿瓧鏃犲尮閰嶇粨鏋溿€?- `go test ./...` 閫氳繃銆?- 璁块棶 `http://localhost:8023/health` 鎴愬姛锛岃繑鍥?`deps.mode = mysql`銆?### 鍚庣画褰卞搷
- 椤圭洰鏁版嵁搴撳眰鐜板湪瀹屽叏鎸夎璁¤鏄庤蛋 MySQL銆?- 鍚庣画鏈湴鍚姩鍓嶉渶瑕佺‘淇?MySQL 鏈嶅姟鍙敤锛屽苟宸插垱寤?`studymate` 鏁版嵁搴撱€?- 鏃㈡湁鏃ф湰鍦版暟鎹簱鏂囦欢宸插垹闄わ紱濡傛灉鏈潵闇€瑕佸巻鍙叉暟鎹紝搴斾粠澶栭儴澶囦唤鍙﹀仛涓€娆℃€у鍏ヨ剼鏈€?
## 2026-05-27 00:18:42 +08:00 | v0.0.22 | 淇鍏抽敭鏂囨。骞剁粺涓€绠＄悊绔富棰?### 浠诲姟鍐呭
- 妫€鏌ュ綋鍓嶅墠绔富棰樻槸鍚︾湡姝ｇ粺涓€锛屽苟瀹氫綅鏈畬鎴愮粺涓€娓叉煋鐨勫悗鍙伴儴鍒嗐€?- 淇 README銆佸紑鍙戞枃妗ｃ€佸墠绔璁℃柟妗堝拰椤圭洰鏃ュ織涓殑鐪熷疄涔辩爜涓庢崯鍧忓唴瀹广€?- 缁х画鏀舵暃绠＄悊绔紝浣垮叾鍥炲埌涓庣敤鎴风涓€鑷寸殑璁捐璇█銆?### 瀹屾垚缁撴灉
- 閲嶅缓 `README.md`锛屾仮澶嶉」鐩杩般€佹妧鏈爤銆佸綋鍓嶉樁娈靛拰鏂囨。鍏ュ彛銆?- 閲嶅缓 `docs/DEVELOPMENT.md`锛屾仮澶嶇幆澧冭鏄庛€佸惎鍔ㄦ柟寮忋€佺鍙ｈ鏄庡拰 Go 浠ｇ悊鎺掓煡銆?- 閲嶅缓 `docs/design/FRONTEND_REBUILD_PLAN.md`锛屾仮澶嶅墠绔洰鏍囥€佽璁″師鍒欍€佺粨鏋勮鍒掑拰瀹炴柦椤哄簭銆?- 閲嶅啓 `PROJECT_LOG.md`锛屾竻鐞嗗巻鍙蹭贡鐮侊紝骞舵寜鐗堟湰閲嶆柊鏁寸悊椤圭洰鎺ㄨ繘璁板綍銆?- 鏀舵暃绠＄悊绔富棰橈紝浣垮叾涓庣敤鎴风缁х画鍥寸粫鍚屼竴濂楁殩鐏拌儗鏅€佹澗鏌忕豢涓昏壊銆佺惀鐝€寮鸿皟鑹插拰鍦嗚鍗＄墖浣撶郴灞曞紑銆?- 淇鍓嶅悗鍙?HTML 鏍囬涓烘甯镐腑鏂囥€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 褰撳墠鍏抽敭鏂囨。宸茬粡鎭㈠涓哄彲璇讳腑鏂囷紝涓嶅啀褰卞搷鍚庣画寮€鍙戝拰浜ゆ帴銆?- 绠＄悊绔拰鐢ㄦ埛绔殑涓婚涓€鑷存€ф槑鏄炬彁楂橈紝鍚庣画鍙互缁х画鍩轰簬缁熶竴璁捐绯荤粺鍋氭ā鍧楁繁鍖栥€?
## 2026-05-26 23:13:49 +08:00 | v0.0.21 | 閲嶆瀯鍓嶇涓诲簲鐢ㄥ苟淇鍓嶇鍙涔辩爜
### 浠诲姟鍐呭
- 缁х画鎸夋柊鐨勫墠绔噸鏋勬柟妗堟帹杩涢樁娈?B锛屼紭鍏堟妸璧勬枡搴撱€侀槄璇诲櫒銆佺瑪璁伴〉閲嶆柊鎺ュ洖缁熶竴宸ヤ綔鍖哄３灞傘€?- 淇褰撳墠鍓嶇鍙鐨勪贡鐮侀棶棰橈紝鍖呮嫭婧愮爜涓枃鏂囨鎹熷潖鍜屾帴鍙ｈ繑鍥炲巻鍙茶剰鏁版嵁涓殑涓€涓查棶鍙锋樉绀恒€?### 瀹屾垚缁撴灉
- 閲嶅啓鐢ㄦ埛绔富搴旂敤澹冲眰鍜岃矾鐢便€?- 璧勬枡搴撴帴鍥炴悳绱€侀檮浠朵笂浼犮€佽祫鏂欏垱寤恒€佺紪杈戙€佹敹钘忋€佽瘎鍒嗗拰闃呰鍏ュ彛銆?- 闃呰鍣ㄦ帴鍥炵湡瀹為槄璇荤姸鎬併€侀〉鐮佽繘搴︺€佷功绛惧拰鎵规敞銆?- 绗旇椤垫帴鍥炲瘜鏂囨湰缂栬緫銆佸叧鑱旇祫鏂欍€佺増鏈巻鍙层€佹仮澶嶇増鏈拰鍒犻櫎鍔ㄤ綔銆?- 閲嶅啓瀵屾枃鏈紪杈戝櫒涓?PDF 闃呰鍣ㄧ粍浠躲€?- 閲嶅啓绠＄悊绔３灞傦紝淇濈暀绠＄悊鍛樼櫥褰曞拰瀹℃牳閾捐矾銆?- 瀵规帴鍙ｅ巻鍙茶剰鏁版嵁涓殑 `????` 鍋氬墠绔睍绀哄厹搴曘€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 鍓嶇涓荤晫闈粠鈥滃３灞傚崰浣嶁€濇帹杩涘埌鈥滃３灞?+ 鐪熷疄璧勬枡/闃呰/绗旇閾捐矾骞跺瓨鈥濈殑闃舵銆?
## 2026-05-26 21:02:26 +08:00 | v0.0.20 | 鍒涘缓鍓嶅彴娴嬭瘯璐﹀彿 use123
### 浠诲姟鍐呭
- 涓哄墠鍙扮敤鎴风鍒涘缓涓€涓彲鐩存帴鐧诲綍鐨勬櫘閫氱敤鎴疯处鍙枫€?### 瀹屾垚缁撴灉
- 閫氳繃 `POST /api/v1/auth/register` 鎴愬姛鍒涘缓鏈湴娴嬭瘯璐﹀彿锛?  - 鐢ㄦ埛鍚嶏細`use123`
  - 瀵嗙爜锛歚123123123`
  - 閭锛歚11111@qq.com`
  - 鏄剧ず鍚嶏細`use123`
- 閫氳繃鐧诲綍鎺ュ彛楠岃瘉璇ヨ处鍙峰彲鐢ㄣ€?### 楠岃瘉缁撴灉
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
### 鍚庣画褰卞搷
- 璇ヨ处鍙峰彲鐩存帴鐢ㄤ簬鏈湴鍓嶅彴鑱旇皟鍜屼綋楠岄獙璇併€?
## 2026-05-26 20:25:26 +08:00 | v0.0.19 | 鍚姩鍓嶇闃舵 A锛岄噸鍋氱敤鎴风涓庣鐞嗙鍏ㄥ眬澹冲眰
### 浠诲姟鍐呭
- 寮€濮嬫寜鐓у墠绔噸寤鸿璁℃柟妗堝疄闄呴噸鍋氬墠绔€?- 鐢ㄩ珮璐ㄩ噺鍗犱綅鎵挎帴鏈疄鐜版ā鍧椼€?### 瀹屾垚缁撴灉
- 閲嶅啓鐢ㄦ埛绔３灞傦細椤堕儴鎼滅储銆佸乏渚у鑸€佷腑閮ㄥ伐浣滃尯銆佸彸渚т笂涓嬫枃闈㈡澘銆?- 閲嶅啓绠＄悊绔３灞傦細姒傝銆佸鏍搞€佽祫鏂欍€佺ぞ鍖恒€佺敤鎴枫€佸浘璋辨ā鏉裤€丄I銆佺郴缁熼厤缃€佸璁℃棩蹇椼€?- 鐢熸垚鏂板３灞傞〉闈㈠揩鐓х敤浜庡鐓с€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 鍓嶇浠庘€滆鏄庨〉 + 涓存椂琛ㄥ崟椤碘€濊繘鍏ョ粺涓€宸ヤ綔鍖哄３灞傞樁娈点€?
## 2026-05-26 19:53:45 +08:00 | v0.0.18 | 琛ュ厖鍓嶇瀵规爣浜у搧鍙傝€冧笌缁熶竴椋庢牸绾︽潫
### 浠诲姟鍐呭
- 灏嗏€滃弬鑰冨ご閮ㄤ骇鍝佷俊鎭灦鏋勶紝浣嗕繚鎸?StudyMate 鑷繁鐨勭粺涓€椋庢牸鈥濆啓鍏ヨ璁℃柟妗堛€?### 瀹屾垚缁撴灉
- 鏇存柊 `docs/design/FRONTEND_REBUILD_PLAN.md`銆?- 澧炲姞瀵规爣鍘熷垯銆佹ā鍧楀鏍囩煩闃点€佺粺涓€涓婚瑕佹眰鍜岃惤鍦拌鍒欍€?### 楠岃瘉缁撴灉
- 鏂囨。妫€鏌ュ畬鎴愩€?### 鍚庣画褰卞搷
- 鍚庣画鍓嶇瀹炵幇灏嗕互鈥滄ā鍧楀€熼壌 + 鍏ㄥ眬缁熶竴鈥濈殑鏂瑰紡鎺ㄨ繘銆?
## 2026-05-26 19:41:48 +08:00 | v0.0.17 | 娴忚褰撳墠鍓嶇骞惰緭鍑烘暣浣撻噸寤鸿璁℃柟妗?### 浠诲姟鍐呭
- 娴忚鐢ㄦ埛绔拰绠＄悊绔綋鍓嶉〉闈€?- 鏍规嵁鏈€缁堥」鐩洰鏍囬噸鏂拌鍒掓暣涓墠绔粨鏋勪笌瀹炴柦椤哄簭銆?### 瀹屾垚缁撴灉
- 鐢熸垚 `docs/design/FRONTEND_REBUILD_PLAN.md`銆?- 纭褰撳墠鍓嶇闇€瑕佹暣浣撻噸鍋氾紝鑰屼笉鏄户缁ˉ涓佸紡杩唬銆?### 楠岃瘉缁撴灉
- 鏈湴鐢ㄦ埛绔笌绠＄悊绔〉闈㈠揩鐓у凡鐢熸垚銆?### 鍚庣画褰卞搷
- 涓哄悗缁墠绔噸鏋勬彁渚涚粺涓€璺嚎鍥俱€?
## 2026-05-26 19:07:33 +08:00 | v0.0.16 | 缁х画鍔犲帤 v0.4.0锛岃ˉ榻愰槄璇绘壒娉ㄥ洖璺冲拰绗旇鎽樺綍琛旀帴
### 浠诲姟鍐呭
- 鍔犲帤闃呰涓庣瑪璁颁箣闂寸殑鍓嶅彴浣撻獙銆?### 瀹屾垚缁撴灉
- 鎵规敞鏀寔鍥炶烦鍒板搴?PDF 椤点€?- 绗旇椤垫柊澧炶祫鏂欏紩鐢ㄥ崱鐗囥€?- 鏂板闃呰鎽樺綍姹狅紝鍙皢鎵规敞鍐呭鎻掑叆瀵屾枃鏈鏂囥€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷
- 闃呰鍒扮瑪璁扮殑閾捐矾鏇村畬鏁淬€佹洿椤烘墜銆?
## 2026-05-26 18:50:09 +08:00 | v0.0.15 | 鍔犲帤 v0.4.0 瀵屾枃鏈紪杈戜笌 PDF 浜や簰锛屽苟浼樺寲鍚庡彴鏋勫缓浣撶Н
### 浠诲姟鍐呭
- 寮曞叆鏇村儚鏍风殑瀵屾枃鏈紪杈戝櫒鍜?PDF 闃呰浜や簰銆?- 澶勭悊绠＄悊绔瀯寤哄寘浣撳亸澶х殑璀﹀憡銆?### 瀹屾垚缁撴灉
- 鎺ュ叆 Tiptap 瀵屾枃鏈紪杈戝櫒銆?- 鎺ュ叆 react-pdf 闃呰鍣紝鏀寔缈婚〉銆佺缉鏀俱€佽烦椤靛拰閫変腑鏂囨湰鎽樺綍銆?- 鐢ㄦ埛绔仛鍒嗗寘浼樺寲銆?- 绠＄悊绔Щ闄よ繍琛屾椂 Element Plus 渚濊禆锛岄檷浣庝富鍖呬綋绉€?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 闃呰涓庣瑪璁颁綋楠屼粠鈥滆兘鐢ㄢ€濇帹杩涘埌鏇村儚鐪熷疄浜у搧銆?
## 2026-05-26 13:48:29 +08:00 | v0.0.14 | 瀹炵幇 v0.4.0 闃呰绗旇鐗堢涓€鏉′笟鍔￠棴鐜?### 浠诲姟鍐呭
- 鎵撻€氳祫鏂欓槄璇汇€侀槄璇昏繘搴︺€佹壒娉ㄤ笌璧勬枡鍏宠仈绗旇鐨勭涓€鏉′富閾捐矾銆?### 瀹屾垚缁撴灉
- 鍚庣鏂板 `note` 鍜?`reader` 鐩稿叧鑳藉姏銆?- 鍓嶅彴鐢ㄦ埛绔帴鍥為槄璇婚〉涓庣瑪璁伴〉銆?- 鏀寔闃呰杩涘害銆佷功绛俱€佹壒娉ㄣ€佺瑪璁扮増鏈巻鍙插拰鐗堟湰鎭㈠銆?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- `v0.4.0` 寮€濮嬪叿澶囩湡瀹炲彲鐢ㄧ殑闃呰娌夋穩璺緞銆?
## 2026-05-26 13:29:58 +08:00 | v0.0.13 | 绠＄悊绔鍙ｈ皟鏁村埌 8002
### 浠诲姟鍐呭
- 灏嗗悗鍙扮鐞嗙榛樿绔彛浠庢棫鍊艰皟鏁村埌 `8002`銆?### 瀹屾垚缁撴灉
- 绠＄悊绔粯璁ょ鍙ｆ敼涓?`8002`锛屽苟琛ラ綈鏂囨。璇存槑銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
### 鍚庣画褰卞搷
- 褰撳墠鏈湴榛樿绔彛涓猴細鐢ㄦ埛绔?`8001`銆佺鐞嗙 `8002`銆佸悗绔?`8023`銆?
## 2026-05-26 13:18:47 +08:00 | v0.0.12 | 璋冩暣鐢ㄦ埛绔笌鍚庣榛樿绔彛
### 浠诲姟鍐呭
- 灏嗙敤鎴风鏀逛负 `8001`锛屽悗绔敼涓?`8023`銆?### 瀹屾垚缁撴灉
- 鐢ㄦ埛绔惎鍔ㄧ鍙ｈ皟鏁翠负 `8001`銆?- 鍚庣榛樿鍚姩绔彛璋冩暣涓?`8023`銆?- 鍚屾鏇存柊浠ｇ悊銆丆ORS 鍜屽紑鍙戣鏄庛€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
### 鍚庣画褰卞搷
- 鍓嶅悗绔湰鍦拌仈璋冪鍙ｇ粺涓€绋冲畾涓嬫潵銆?
## 2026-05-26 12:55:21 +08:00 | v0.0.11 | 淇 Go 妯″潡浠ｇ悊鎶ラ敊
### 浠诲姟鍐呭
- 澶勭悊 GoLand 鍜屽懡浠よ涓?`goproxy.io` 瀵艰嚧鐨勪緷璧栨媺鍙栧け璐ラ棶棰樸€?### 瀹屾垚缁撴灉
- 纭鏍瑰洜鏄?`GOPROXY=https://goproxy.io` 鍥炴簮澶辫触銆?- 楠岃瘉 `https://goproxy.cn,direct` 涓?`https://proxy.golang.org,direct` 鍙敤銆?- 鏇存柊鐢ㄦ埛绾?`GOPROXY` 骞惰ˉ鍏呮枃妗ｈ鏄庛€?### 楠岃瘉缁撴灉
- `go list -m -json all`
### 鍚庣画褰卞搷
- 鍚庣画 Go 渚濊禆鎷夊彇鍜?IDE 绱㈠紩鎭㈠姝ｅ父銆?
## 2026-05-26 11:36:40 +08:00 | v0.0.10 | 瀹炵幇 v0.3.0 绀惧尯璧勬枡鐗堢涓€鏉￠棴鐜?### 浠诲姟鍐呭
- 鎵撻€氳祫鏂欏簱銆佺ぞ鍖哄彂甯栧拰鍚庡彴瀹℃牳鐨勭涓€鏉′富閾捐矾銆?### 瀹屾垚缁撴灉
- 绀惧尯鏀寔鍙戝笘銆佽鎯呫€佷竴绾ц瘎璁恒€佺偣璧炪€佹敹钘忋€?- 璧勬枡搴撴敮鎸佽祫鏂欏垱寤恒€佽鎯呫€佹敹钘忋€佽瘎鍒嗐€?- 鍚庡彴鏀寔寰呭鏍稿笘瀛愬拰璧勬枡鐨勯€氳繃銆侀┏鍥炪€佷笅鏋躲€?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 椤圭洰浠庘€滃熀纭€骞冲彴鈥濇帹杩涘埌鈥滃唴瀹瑰钩鍙扳€濄€?
## 2026-05-26 09:18:12 +08:00 | v0.0.9 | 鎸夌増鏈鍒掔户缁帹杩涘钩鍙板熀纭€鑳藉姏
### 浠诲姟鍐呭
- 鎸?`v0.2.0` 瑙勫垝瀹炵幇璐﹀彿銆佹枃浠躲€佽祫鏂欎笌鍚庡彴鍩虹鑳藉姏銆?### 瀹屾垚缁撴灉
- 瀹屾垚鐢ㄦ埛娉ㄥ唽銆佺櫥褰曘€佸埛鏂般€侀€€鍑恒€佷釜浜鸿祫鏂欒鍙栦笌鏇存柊銆?- 瀹屾垚鏂囦欢涓婁紶銆?- 瀹屾垚绠＄悊鍛樼櫥褰曚笌绠＄悊鍛樿祫鏂欒鍙栥€?- 榛樿鏈湴寮€鍙戞暟鎹簱鑳藉姏宸插湪鍚庣画鐗堟湰缁熶竴鏀舵暃涓?MySQL銆?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- 骞冲彴鍩虹灞傚畬鎴愶紝鍚庣画鍙户缁帴璧勬枡搴撲笌绀惧尯闂幆銆?
## 2026-05-26 00:58:30 +08:00 | v0.0.8 | 鐢熸垚鏈潵鐗堟湰瑙勫垝鏂囨。
### 浠诲姟鍐呭
- 鏍规嵁鏈€缁堥」鐩洰鏍囪鍒掓湭鏉ュ紑鍙戦樁娈碉紝骞朵负鍚勯樁娈电敓鎴愮増鏈鏄庛€?### 瀹屾垚缁撴灉
- 鐢熸垚 `docs/planning/VERSION_PLAN.md`銆?- 鐢熸垚 `v0.1.0` 鍒?`v1.0.0` 鐨勯樁娈电増鏈鏄庢枃妗ｃ€?### 楠岃瘉缁撴灉
- 鏂囨。妫€鏌ュ畬鎴愩€?### 鍚庣画褰卞搷
- 鍚庣画寮€鍙戝拰鎷嗕换鍔℃湁浜嗙ǔ瀹氱増鏈富绾裤€?
## 2026-05-26 00:53:17 +08:00 | v0.0.7 | 楠岃瘉椤圭洰涓昏瑷€鍒囨崲鍒颁腑鏂?### 浠诲姟鍐呭
- 纭椤圭洰鏂囨。銆佹爣棰樺拰璇存槑榛樿浣跨敤涓枃銆?### 瀹屾垚缁撴灉
- 楠岃瘉 README銆佸紑鍙戣鏄庛€佽鍒掓枃妗ｅ拰鍓嶅悗鍙版爣棰樺凡鍒囧埌涓枃涓昏瑷€銆?### 楠岃瘉缁撴灉
- `npm run typecheck`
- `go test ./...`
### 鍚庣画褰卞搷
- 椤圭洰鍚庣画鏂囨。銆佹棩蹇楀拰 UI 鏂囨榛樿鐢ㄦ眽璇€?
## 2026-05-26 00:51:42 +08:00 | v0.0.6 | 纭珛椤圭洰涓昏璇█涓烘眽璇?### 浠诲姟鍐呭
- 灏嗛」鐩富璇█姝ｅ紡纭珛涓烘眽璇€?### 瀹屾垚缁撴灉
- 鏂囨。銆佹棩蹇椼€佽鏄庡拰鍓嶅悗鍙版爣棰橀粯璁ゆ敼涓轰腑鏂囥€?- 淇濈暀浠ｇ爜鏍囪瘑绗︺€佸寘鍚嶃€佸懡浠ゃ€丄PI 璺緞绛夊伐绋嬬害瀹氱殑鑻辨枃鍐欐硶銆?### 楠岃瘉缁撴灉
- 鏂囨。妫€鏌ュ畬鎴愩€?### 鍚庣画褰卞搷
- 鍚庣画鎵€鏈夎鏄庣被鍐呭缁熶竴鏀圭敤涓枃銆?
## 2026-05-26 00:46:30 +08:00 | v0.0.5 | 鍚姩鏈湴寮€鍙戞湇鍔″苟琛ュ厖寮€鍙戣鏄?### 浠诲姟鍐呭
- 鍚姩鏈湴寮€鍙戞湇鍔″苟瀹屾垚鏈€灏忓紑鍙戣鏄庛€?### 瀹屾垚缁撴灉
- 鍚姩鍚庣涓庡墠鍚庡彴鏈湴寮€鍙戞湇鍔°€?- 璁板綍绔彛鍗犵敤鎯呭喌骞惰皟鏁翠复鏃剁鍙ｃ€?- 琛ュ厖 `docs/DEVELOPMENT.md`銆?### 楠岃瘉缁撴灉
- 鍚庣 `/health`
- 鐢ㄦ埛绔?HTTP 200
- 绠＄悊绔?HTTP 200
### 鍚庣画褰卞搷
- 鏈湴寮€鍙戦摼璺畬鏁磋窇閫氥€?
## 2026-05-26 00:43:41 +08:00 | v0.0.4 | 楠岃瘉鍩虹宸ョ▼鍙紪璇戝彲杩愯
### 浠诲姟鍐呭
- 楠岃瘉 Go 涓庡墠绔熀纭€宸ョ▼鍙紪璇戙€?### 瀹屾垚缁撴灉
- 瀹屾垚 `go mod tidy`銆?- 瀹屾垚鍓嶅悗鍙颁緷璧栧畨瑁呫€?- 瀹屾垚鍓嶅悗鍙扮被鍨嬫鏌ュ拰鏋勫缓楠岃瘉銆?### 楠岃瘉缁撴灉
- `go test ./...`
- `npm run typecheck`
- `npm run build:user`
- `npm run build:admin`
### 鍚庣画褰卞搷
- Phase 0 鐨勫熀纭€宸ョ▼搴曞骇宸茬粡鍙繍琛屻€?
## 2026-05-26 00:34:12 +08:00 | v0.0.3 | 琛ラ綈閰嶇疆銆佸叆鍙ｃ€佸叡浜寘鍜岄」鐩枃妗?### 浠诲姟鍐呭
- 涓?monorepo 琛ラ綈鍩虹閰嶇疆銆佸簲鐢ㄥ叆鍙ｃ€佸叡浜寘鍜岄」鐩枃妗ｃ€?### 瀹屾垚缁撴灉
- 瀹屽杽 `.gitignore`銆乣.env.example`銆乣package.json`銆乣README.md`銆?- 鍒濆鍖?Go 妯″潡鍜屽悗绔仴搴锋鏌ュ叆鍙ｃ€?- 鍒濆鍖?React/Vite 鐢ㄦ埛绔拰 Vue/Vite 绠＄悊绔鏋躲€?- 鍒濆鍖栧叡浜寘鍗犱綅涓?`docs` 鐩綍銆?### 楠岃瘉缁撴灉
- 浠ｇ爜缁撴瀯妫€鏌ュ畬鎴愩€?### 鍚庣画褰卞搷
- 椤圭洰鍏峰缁х画鎵╁睍鍚庣 API 鍜屽弻鍓嶇 UI 鐨勫熀纭€銆?
## 2026-05-26 00:31:33 +08:00 | v0.0.2 | 鍒濆鍖?monorepo 宸ョ▼楠ㄦ灦
### 浠诲姟鍐呭
- 鏍规嵁瑙勫垝鍒濆鍖?StudyMate monorepo 鐩綍缁撴瀯銆?### 瀹屾垚缁撴灉
- 鍒涘缓 `backend`銆乣frontend-user`銆乣frontend-admin`銆乣packages`銆乣docs`銆乣storage` 绛夌洰褰曘€?- 棰勭暀妯″潡鍒嗗眰涓庡叡浜寘缁撴瀯銆?### 楠岃瘉缁撴灉
- 鐩綍妫€鏌ュ畬鎴愩€?### 鍚庣画褰卞搷
- 椤圭洰杩涘叆 Phase 0 宸ョ▼鍒濆鍖栭樁娈点€?
## 2026-05-26 00:30:33 +08:00 | v0.0.1 | 鍒涘缓鍏ㄥ眬椤圭洰璁板綍鏂囦欢
### 浠诲姟鍐呭
- 鏍规嵁闇€姹傚垱寤哄叏灞€ log 鏂囦欢锛屽苟绾﹀畾鎸夌増鏈拰鏃堕棿鍊掑簭鍐欏叆銆?### 瀹屾垚缁撴灉
- 鏂板缓 `PROJECT_LOG.md`銆?- 纭珛椤圭洰璁板綍鏍煎紡銆?### 楠岃瘉缁撴灉
- 鏂囦欢鍒涘缓瀹屾垚銆?### 鍚庣画褰卞搷
- 鍚庣画姣忎竴姝ラ噸瑕佸伐浣滈兘鍙互杩芥函鍒板搴旂増鏈褰曘€?
## 2026-06-01 22:50:00 +08:00 | v0.0.76 | 鏀跺彛 Review/AI銆丼earch/Admin/Share

### 浠诲姟鍐呭
- 鎸?D 闃舵瑕佹眰琛ラ綈澶嶄範璋冨害杈圭晫銆佸悗绔悳绱€佸垎浜摼鎺ュ拰鍚庡彴娌荤悊妯″潡銆?- 淇濇寔 SM-2 浣滀负 v1 榛樿璋冨害绠楁硶锛屼絾璁╄皟搴﹀櫒鍏峰鍙浛鎹㈡帴鍙ｃ€?- 灏嗘悳绱㈠拰鍚庡彴鍗犱綅椤垫帴鍒扮湡瀹?API锛岄伩鍏?v1 鍙戝竷鏃朵粛渚濊禆娴忚鍣ㄧ鍏ㄩ噺杩囨护鎴栭潤鎬佸崰浣嶃€?
### 瀹屾垚缁撴灉
- `backend/internal/modules/card/service` 鏂板 `Scheduler` 鎺ュ彛涓?`SM2Scheduler` 榛樿瀹炵幇锛宍ReviewCard` 閫氳繃鎺ュ彛璁＄畻涓嬩竴娆″埌鏈熸椂闂淬€?- 鏂板 `backend/internal/modules/search`锛屾敞鍐?`GET /api/v1/search?q=&types=&limit=`锛屾敮鎸佸叕寮€璧勬枡/绀惧尯涓庣櫥褰曞悗鐨勭鏈?note/graph/card 鍒嗙粍缁撴灉銆?- 鏂板 `backend/internal/modules/share` 涓?`004_share_links.sql`锛屾敮鎸?share link 鍒涘缓銆佸垪琛ㄣ€佹挙閿€鍜屽叕寮€ token 鍙瑙ｆ瀽锛涚敤鎴风鏂板 `/share/:token` 椤甸潰銆?- 鍚庡彴鏂板 `/api/v1/admin/users`銆乣/reports`銆乣/tags`銆乣/ai/tasks`銆乣/ai/usage`銆乣/audit-logs`銆乣/files`锛岀鐞嗙鎸夋ā鍧楄鍙栫湡瀹炴不鐞嗘暟鎹€?- 鐢ㄦ埛绔悳绱㈤〉鏀逛负娑堣垂鍚庣 grouped payload锛汚PI barrel 澧炲姞 search/share 鍩熸ā鍧椼€?
### 楠岃瘉缁撴灉
- `cd backend; go test ./...` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `npm --workspace frontend-admin run typecheck` 閫氳繃銆?- `npm run ci` 閫氳繃锛氳鐩?lint/docs/typecheck銆佺敤鎴风鍜屽悗鍙版瀯寤恒€佸墠鍚庡彴 Vitest銆乬raph-core 娴嬭瘯銆丳laywright E2E銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ャ€?
### 鍚庣画褰卞搷
- E 闃舵鍙互鍦ㄥ凡鏈夋悳绱€佸垎浜拰鍚庡彴娌荤悊鎺ュ彛涓婅ˉ鍙戝竷娓呭崟銆佸洖婊氭楠ゃ€佽鐩栫巼姹囨€汇€乻ecret scan 鍜屾湰鍦?`v1.0.0` 鏍囩銆?
## 2026-06-01 23:20:00 +08:00 | v1.0.0-rc | 鍙戝竷涓庡洖婊氭敹鍙?
### 浠诲姟鍐呭
- 鎸?E 闃舵瑕佹眰琛ラ綈 release checklist銆乪nv var matrix銆乵igration order銆乨emo data steps銆乺ollback steps 鍜?known non-blockers銆?- 灏?`CHANGELOG.md` 鏍囪涓?`v1.0.0 - 2026-06-01`銆?- 鍑嗗鏈€缁堥獙璇侊細瀹屾暣 CI銆佽鐩栫巼姹囨€汇€乻ecret scan銆乨iff review銆乺elease smoke flow 鍜屾湰鍦?tag銆?
### 瀹屾垚缁撴灉
- `docs/planning/versions/v1.0.0-release.md` 宸叉垚涓?v1 鍙戝竷/鍥炴粴涓绘枃妗ｃ€?- README銆佸紑鍙戣鏄庛€佺増鏈鍒掋€佽矾绾垮浘銆佸彉鏇磋褰曞拰椤圭洰鏃ュ織宸插悓姝ュ彂甯冮棬绂併€?
### 楠岃瘉缁撴灉
- `npm run ci` 閫氳繃锛歭int/docs/typecheck銆佸墠鍚庡彴鏋勫缓銆佸墠鍚庡彴 Vitest銆乬raph-core 娴嬭瘯銆丳laywright public shell銆佸悗绔?`go test ./...` 鍜屾渶缁堟枃妗ｅ悓姝ュ潎閫氳繃銆?- `npm run test:coverage` 閫氳繃锛歠rontend-user statements 52.3%锛宖rontend-admin statements 30.13%锛実raph-core line 97.55%锛宐ackend `go test ./... -cover` 瀹屾垚銆傚墠鍚庡彴鎬讳綋瑕嗙洊鐜囧皻鏈揪鍒?80%锛屼綔涓?v1 宸茬煡瑕嗙洊鐜囩己鍙ｈ褰曪紝鍚庣画浠ラ噸鐐瑰彉鏇村寘閫愭琛ラ綈銆?- Secret scan 瀹屾垚锛氬懡涓」涓哄彂甯冩枃妗ｄ腑鐨勬壂鎻忕ず渚?env 鍚嶇О銆佹祴璇曠敤 `"secret"` 瀛楃涓层€乼oken 鍙橀噺鍚嶅拰 CSS 绫诲悕锛屾病鏈夊彂鐜扮湡瀹炵敓浜у瘑閽ャ€?- `git diff --check` 閫氳繃锛況elease smoke flow 鐢辨湰杞?CI 涓殑鏋勫缓銆丳laywright public shell 鍜屽悗绔祴璇曡鐩栥€?
### 鍚庣画褰卞搷
- 鏈樁娈靛畬鎴愬悗 `master` 鍙繘鍏ユ湰鍦?`v1.0.0` 鏍囩锛涢櫎闈炵敤鎴锋槑纭壒鍑嗭紝涓嶆帹閫?commit 鎴?tag 鍒拌繙绔€?
## 2026-06-05 20:05:00 +08:00 | v1.1-graph-productization | 鍥捐氨宸ヤ綔鍖轰骇鍝佸寲琛ュ己

### 浠诲姟鍐呭
- 鏍规嵁 Project Graph 瀵规爣璁″垝缁х画鎺ㄨ繘 StudyMate 鍥捐氨宸ヤ綔鍖猴紝涓嶉噸鍐欑幇鏈夊己 MVP銆?- 浼樺厛琛ラ綈鎵╁睍鑺傜偣 metadata 缂栬緫銆佸彲瑙ｉ噴 history label銆丣SON 瀵煎叆鏉ユ簮鏍￠獙銆佸悗绔?error 绾х粨鏋勬姢鏍忓拰 200 鑺傜偣 smoke 淇濆瓨璺緞銆?
### 瀹屾垚缁撴灉
- 鐢ㄦ埛绔浘璋辨墿灞曡妭鐐瑰凡鏀寔 URL銆佸浘鐗囥€佸叕寮忓拰 PDF 閿氱偣鐨勭粨鏋勫寲 `metadata.content` 缂栬緫锛屽悓鏃朵繚鐣欓€氱敤鏍囬銆佹弿杩般€佹潵婧愩€侀鑹层€佸己璋冨拰灏哄缂栬緫銆?- 鐢ㄦ埛绔?history 鐘舵€佹柊澧?`lastLabel` 鍜屽甫 label 鐨?past/future 璁板綍锛屽鍏ャ€佹挙閿€銆侀噸鍋氬拰淇濆瓨鐘舵€佸叿澶囧彲瑙ｉ噴鍘嗗彶璇箟銆?- 鐢ㄦ埛绔?`.smtg` JSON 瀵煎叆浼氭牎楠?schemaVersion銆侀噸澶?ID銆侀潪娉曞昂瀵搞€佹偓鎸傝竟鍜屾棤鏁堟潵婧?target锛涙棤鏁堟潵婧?target 鏍规嵁褰撳墠鍥捐氨宸叉湁鏉ユ簮鍙婂凡鍔犺浇璧勬枡/绗旇鍒ゆ柇銆?- 鍚庣 `BatchSave` 鍜屽鍏?AI 鑽夌钀藉簱鍓嶄細鎷掔粷 error 绾у浘璋辩粨鏋勯棶棰橈紝warning/info 绾ф不鐞嗘彁绀轰粛鍏佽淇濆瓨銆?- 鍥捐氨 controller 缁х画鎷嗗嚭 autosave/beforeunload銆佸彸閿彍鍗曞叧闂拰 stage 娴嬮噺鐢熷懡鍛ㄦ湡 hook锛岄檷浣庡ぇ鍨?controller 鐨勮亴璐ｅ瘑搴︺€?- `e2e/v1-graph-workspace.spec.ts` 鐨?200 鑺傜偣 smoke 澧炲姞鎵嬪姩淇濆瓨骞舵柇瑷€淇濆瓨鐘舵€併€?- 缁х画鎶婂浘璋卞伐浣滃尯 header銆佹潵婧?rail 鍜?toolbar 鎷嗗埌 `GraphWorkspaceShell` 绾鍥剧粍浠讹紝toolbar 涓嶅啀閫氳繃娲惧彂閿洏浜嬩欢瑙﹀彂鎾ら攢/閲嶅仛锛岃€屾槸澶嶇敤鍛藉悕 controller 鍔ㄤ綔銆?- 鏂板 `GraphWorkspaceShell.test.tsx`锛岃鐩栦繚瀛樼姸鎬?aria-label銆乼oolbar aria-label銆佽妭鐐圭被鍨嬪垏鎹㈠拰鎼滅储瀹氫綅瑙﹀彂銆?
### 楠岃瘉缁撴灉
- `npm --workspace frontend-user run test -- GraphWorkspacePage graphHistory graphNodeMetadata graphFileImportExport` 閫氳繃銆?- `npm --workspace frontend-user run test -- GraphWorkspaceShell GraphWorkspacePage` 閫氳繃銆?- `npm --workspace frontend-user run typecheck` 閫氳繃銆?- `cd backend && go test ./internal/modules/graph/...` 閫氳繃銆?
### 鍚庣画褰卞搷
- 鍚庣画鏈€鍊煎緱缁х画鎺ㄨ繘鐨勬槸鎶婂浘璋辨暟鎹姞杞姐€佺敾甯冧氦浜掑拰 JSX view 瀹屾暣鎷嗘垚瀹瑰櫒 hook + 绾?view锛涜ˉ榻?PNG/SVG/JSON 澶у浘瀵煎嚭澶辫触璺緞锛涘啀鍋氫簨浠惰妭娴佸拰杈硅矾寰勭紦瀛樼瓑鏈夎瘉鎹殑鎬ц兘浼樺寲銆?
### 鎵ц璁板綍锛欶E-02 鍥捐氨 CanvasLayout

- 鎵ц鏃ユ湡锛?026-07-02
- 浠ｇ爜鍩虹嚎锛歚master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 瀹為檯鍙樻洿锛?  - 鏂板 `GraphWorkspaceCanvasChrome.tsx` 涓?`GraphWorkspaceOverviewPanel.tsx`銆?  - 鏂板 `graph-canvas.css`锛屽疄鐜板灞忎笁鍒椼€佷腑灏忓睆瑕嗙洊寮?Dock銆佹墜鏈鸿繎浼煎叏灞忔娊灞夈€?  - 璧勬簮鍖烘敼涓哄浘璋?/ 鏉ユ簮 / 妯℃澘 Tab锛涙鏌ュ櫒鏀逛负姒傝 / 灞炴€?/ 鏉ユ簮 / 鍘嗗彶 / 瀵煎叆 / 鍐茬獊 Tab銆?  - 鍒犻櫎鐢诲竷椤堕儴浜у搧璇存槑锛屼繚鐣欏浘璋辨爣棰樸€佷繚瀛樼姸鎬佸拰楂橀鎿嶄綔銆?  - 鏃㈡湁 GraphDocument銆佷繚瀛樸€佺増鏈€佸揩鐓с€佸鍏ュ鍑恒€佹潵婧?relation銆?09 鍐茬獊璇箟淇濇寔涓嶅彉銆?- 宸叉墽琛岄獙璇侊細
  - 鏀瑰姩 TS / TSX 鐨?TypeScript transpile 璇硶妫€鏌ャ€?  - 瀹屾暣 npm 渚濊禆瀹夎鏃犳硶鍦ㄥ綋鍓嶇幆澧冪绾垮畬鎴愶細缂哄皯 `zustand@5.0.13` 缂撳瓨锛屽畬鏁?typecheck / Vitest / build / Playwright 寰呮湰鏈烘垨 CI 澶嶆牳銆?- 涓嬩竴寤鸿浠诲姟锛?  - FE-03锛氶槄璇汇€佺瑪璁颁笌澶嶄範宸ヤ綔鍖轰綋楠屽榻愶紱鎴栧湪鏂?Inspector 涓户缁?WB-032 鐨勮妭鐐圭骇浜哄伐鍐茬獊鍚堝苟銆?
## UI-04 浜у搧绾?UI 鏀跺彛

- 鏍规嵁瀹為檯杩愯鎴浘瀹屾垚鍥捐氨鍜岀鐞嗙甯冨眬瀹¤銆?- 鍥捐氨璋冩暣涓虹敾甯冧紭鍏堬細鍒濆涓嶅睍寮€璧勬簮/妫€鏌ュ櫒锛岄€変腑鑺傜偣鍜屽啿绐佸彂鐢熸椂鎸夐渶鎵撳紑銆?- 鐢ㄦ埛绔?Standard / Studio / Canvas / Focus 缁熶竴涓哄悓涓€瑙嗚绯荤粺锛屽苟娓呯悊寮€鍙戞湡鍗犱綅鏂囨銆?- 绠＄悊绔崌绾т负娌荤悊宸ヤ綔鍙帮細鍙壂鎻忚〃鏍笺€佹悳绱€佸鏍歌鎿嶄綔涓庤褰?Inspector銆?
### 鎵ц璁板綍锛歎I-04 鍏ㄧ珯浜у搧鐣岄潰閲嶆瀯

- 鎵ц鏃ユ湡锛?026-07-03
- 浠ｇ爜鍩虹嚎锛歚master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 瑙﹀彂鍘熷洜锛氭牴鎹疄闄呰繍琛屾埅鍥惧鏍革紝鍥捐氨椤甸潰榛樿璧勬簮鏍忎笌妫€鏌ュ櫒鍚屾椂灞曞紑锛岀敾甯冪┖闂翠笉瓒筹紱绠＄悊绔敤鎴锋不鐞嗘寜璁板綍绾靛悜鍫嗗彔锛屼俊鎭瘑搴︿笌鍙壂鎻忔€т笉瓒炽€?- 鏈疆鑼冨洿锛?  - 鐢ㄦ埛绔叏璺敱缁熶竴涓轰换鍔′紭鍏堢殑 Standard / Studio / Canvas / Focus 甯冨眬浣撶郴锛?  - 鍥捐氨鏀逛负榛樿鍏ㄧ敾甯冿紝璧勬簮 Drawer 涓?Inspector 鎸夐渶鎵撳紑锛岃妭鐐归€変腑鎴栫増鏈啿绐佹椂鑷姩瀹氫綅鐩稿簲 Inspector锛?  - 宸ヤ綔鍙般€佽祫鏂欏簱銆佺ぞ鍖恒€佹悳绱€丄I銆佽缃€佺櫥褰曘€佸垎浜€侀槄璇汇€佺瑪璁般€佸涔犻噸鏂版敹鍙ｅ唴瀹瑰瘑搴︺€佹搷浣滃眰绾т笌鍝嶅簲寮忓竷灞€锛?  - 绠＄悊绔噸鏋勪负杩愯惀娌荤悊宸ヤ綔鍙帮紝鎻愪緵姒傝鎸囨爣銆佸鏍歌〃鏍笺€佹不鐞嗚褰曡〃鏍笺€佹悳绱笌璇︽儏 Inspector銆?- 淇濇姢杈圭晫锛氫笉鏀瑰彉 API銆佹潈闄愩€丟raphDocument銆佸浘璋辩増鏈€佸揩鐓с€佹潵婧愬叧鑱斻€佸鍏ュ鍑哄拰 `409 graph_version_conflict` 濂戠害銆?- 楠岃瘉缁撴灉锛?  - 鍓嶅彴鍏ㄩ噺 TS/TSX 涓庡悗鍙?Vue script 閫氳繃 TypeScript transpile 璇硶妫€鏌ワ紱
  - 鏂囨。鍚屾涓庡墠绔枃浠舵牸寮忔鏌ラ€氳繃锛?  - `npm ci` 鍦ㄤ氦浠樼幆澧冩湭瀹屾垚渚濊禆鏍戞渶缁堥摼鎺ワ紝瀵艰嚧瀹屾暣 tsc/Vitest/Vite/Playwright 鐣欏緟鏈満鎴?CI 鎵ц銆?
### 鎵ц璁板綍锛歎I-04 鍏ㄧ珯浜у搧鐣岄潰閲嶆瀯

- 鎵ц鏃ユ湡锛?026-07-03
- 浠ｇ爜鍩虹嚎锛歚master@7b1e8f3a1e77dded69538d075758dc9529b31564`
- 瑙﹀彂鍘熷洜锛氭牴鎹疄闄呰繍琛屾埅鍥惧鏍革紝鍥捐氨椤甸潰榛樿璧勬簮鏍忎笌妫€鏌ュ櫒鍚屾椂灞曞紑锛岀敾甯冪┖闂翠笉瓒筹紱绠＄悊绔敤鎴锋不鐞嗘寜璁板綍绾靛悜鍫嗗彔锛屼俊鎭瘑搴︿笌鍙壂鎻忔€т笉瓒炽€?- 鏈疆鑼冨洿锛?  - 鐢ㄦ埛绔叏璺敱缁熶竴涓轰换鍔′紭鍏堢殑 Standard / Studio / Canvas / Focus 甯冨眬浣撶郴锛?  - 鍥捐氨鏀逛负榛樿鍏ㄧ敾甯冿紝璧勬簮 Drawer 涓?Inspector 鎸夐渶鎵撳紑锛岃妭鐐归€変腑鎴栫増鏈啿绐佹椂鑷姩瀹氫綅鐩稿簲 Inspector锛?  - 宸ヤ綔鍙般€佽祫鏂欏簱銆佺ぞ鍖恒€佹悳绱€丄I銆佽缃€佺櫥褰曘€佸垎浜€侀槄璇汇€佺瑪璁般€佸涔犻噸鏂版敹鍙ｅ唴瀹瑰瘑搴︺€佹搷浣滃眰绾т笌鍝嶅簲寮忓竷灞€锛?  - 绠＄悊绔噸鏋勪负杩愯惀娌荤悊宸ヤ綔鍙帮紝鎻愪緵姒傝鎸囨爣銆佸鏍歌〃鏍笺€佹不鐞嗚褰曡〃鏍笺€佹悳绱笌璇︽儏 Inspector銆?- 淇濇姢杈圭晫锛氫笉鏀瑰彉 API銆佹潈闄愩€丟raphDocument銆佸浘璋辩増鏈€佸揩鐓с€佹潵婧愬叧鑱斻€佸鍏ュ鍑哄拰 `409 graph_version_conflict` 濂戠害銆?- 楠岃瘉缁撴灉锛?  - 鍓嶅彴鍏ㄩ噺 TS/TSX 涓庡悗鍙?Vue script 閫氳繃 TypeScript transpile 璇硶妫€鏌ワ紱
  - 鏂囨。鍚屾涓庡墠绔枃浠舵牸寮忔鏌ラ€氳繃锛?  - `npm ci` 鍦ㄤ氦浠樼幆澧冩湭瀹屾垚渚濊禆鏍戞渶缁堥摼鎺ワ紝瀵艰嚧瀹屾暣 tsc/Vitest/Vite/Playwright 鐣欏緟鏈満鎴?CI 鎵ц銆?## 2026-07-09 06:02:00 +08:00 | v1.1.0-alpha.121 | 鏀跺彛 DEV-010 宸ョ▼鍙鐜版€у熀绾夸笌瀹¤鍏ュ彛
### 浠诲姟鍐呭

- 鎸夆€滃厛鎶婂叏灞€楠ㄦ灦琛ラ綈鈥濈殑鑺傚锛岀户缁粠 `CODEX_BACKLOG.md` 閫夋嫨瑕嗙洊闈㈡洿骞裤€佷絾涓嶆繁鎸栧崟涓€浜у搧鍔熻兘鐨?`DEV-010`锛屼紭鍏堟敹鍙ｅ伐绋嬪彲澶嶇幇鎬ц€屼笉鏄啀鎵╂柊涓氬姟妯″潡銆?- 鏈疆鐩爣鏄妸宸ュ叿閾剧増鏈害鏉熴€乥ootstrap 鍏ュ彛銆佷緷璧栧璁″叆鍙ｅ拰 `@studymate/graph-core` 鐨?TypeScript 娴嬭瘯杩愯鏂瑰紡鐪熸娌夊埌浠撳簱鏍圭害鏉熼噷锛岃€屼笉鏄户缁彧鍋滅暀鍦ㄦ枃妗ｆ弿杩板眰銆?### 瀹為檯鍙樻洿

- 鏂板 `scripts/workspace-repro.test.mjs`锛屽厛鐢?RED 鏂瑰紡閿佸畾鍥涚被缂哄彛锛氭牴 `package.json` 缂哄皯 `packageManager` / `engines` / `bootstrap` / `verify:runtimes` / `verify:deps`銆乣ci` 鏈墠缃繍琛屾椂鏍￠獙銆乣backend/go.mod` 涓庢枃妗ｆ湭鏀跺彛銆佷互鍙?`@studymate/graph-core` 浠嶉殣寮忎緷璧?`node --test` 鐩存帴璺?`.ts`銆?- 鏂板 `scripts/verify-runtime-baseline.mjs`锛岀粺涓€鏍￠獙鏍?workspace manifest銆乣backend/go.mod`銆佸紑鍙戞枃妗ｃ€佸綋鍓?Node/npm/Go 鐗堟湰涓?`graph-core` 娴嬭瘯鍛戒护锛屼綔涓?`npm run verify:runtimes` 鐨勫疄鐜般€?- 鏂板 `scripts/run-dependency-audits.mjs`锛屾妸 `npm audit --registry=https://registry.npmjs.org/ --audit-level=high` 涓?`go run golang.org/x/vuln/cmd/govulncheck@latest ./...` 鏀跺彛鎴愬崟涓€ `npm run verify:deps` 鍏ュ彛锛岀粫寮€ `npmmirror` 缂哄け audit API 鐨勮€侀棶棰樸€?- 鏇存柊鏍?`package.json`锛氭柊澧?`packageManager: npm@11.6.2`銆乣engines.node >=24 <25`銆乣engines.npm >=11 <12`锛岃ˉ涓?`bootstrap`銆乣verify:runtimes`銆乣verify:deps`锛屽苟璁?`ci` 鍦ㄥ叏閾捐矾鍓嶅厛璺戣繍琛屾椂鍩虹嚎鏍￠獙銆?- 鏇存柊 `packages/graph-core/package.json`锛屽皢娴嬭瘯鍛戒护鏀逛负鏄惧紡 `node --experimental-strip-types --test test/*.test.ts` 涓庤鐩栫巼鍛戒护 `node --experimental-strip-types --experimental-test-coverage --test test/*.test.ts`锛岄伩鍏嶄笉鍚?Node 鐗堟湰瀵?`.ts` 娴嬭瘯鎵ц鑳藉姏鐨勯殣寮忓樊寮傘€?- 鏇存柊 `docs/DEVELOPMENT.md`銆乣README.md` 涓?`.github/workflows/ci.yml`锛屾妸 bootstrap / runtime baseline / dependency audit 鍏ュ彛鍚屾杩涘紑鍙戞枃妗ｃ€佸懡浠ゆ竻鍗曞拰 CI 娴佺▼銆?### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/workspace-repro.test.mjs`
- GREEN锛歚node --test scripts/workspace-repro.test.mjs`
- `npm run verify:runtimes`
- `npm --workspace @studymate/graph-core run test`
- `npm --workspace @studymate/graph-core run test:coverage`
- `npm run bootstrap`
- `npm run verify:docs`
- `npm run verify:deps`
### 鍚庣画褰卞搷

- 褰撳墠浠撳簱宸茬粡鏈夋槑纭€佸彲鎵ц銆佸彲澶嶆牳鐨勮繍琛屾椂鍩虹嚎锛屼笉鍐嶄緷璧栤€淩EADME 閲屽啓浜?Node 24 / Go 1.26鈥濊繖绉嶇函鏂囨。绾︽潫锛涘悗缁柊鏈哄櫒鎺ユ墜鏃跺彲浠ュ厛璺?`npm run bootstrap` 鍜?`npm run verify:runtimes`锛岃€屼笉鏄潬浜哄伐姣斿鐜銆?- `npm run verify:deps` 鐜板湪宸茬粡鑳界ǔ瀹氱粰鍑虹湡瀹炲璁＄粨鏋滐紝浣嗗畠涔熸毚闇蹭簡涓嬩竴鎵归渶瑕佸鐞嗙殑瀹夊叏鍊猴細npm 渚?`esbuild`銆乣glob`銆乣undici`銆乣vite` 楂樺嵄鍛婅锛屼互鍙?Go 渚?`govulncheck` 鍛戒腑鐨勬爣鍑嗗簱銆乣golang.org/x/net` 鍜?`quic-go` 婕忔礊锛涜繖鏇撮€傚悎浣滀负鍚庣画鍗曠嫭鐨勫畨鍏ㄦ敹鍙ｅ伐浣滃寘锛岃€屼笉鏄户缁贩鍦ㄥ伐鍏烽摼鍏ュ彛鏀跺彛閲屻€?## 2026-07-09 06:55:00 +08:00 | v1.1.0-alpha.123 | 鏀跺彛 SEC-011 榛樿 secret scan 闂ㄧ
### 浠诲姟鍐呭

- 鍦?`SEC-010` 宸叉妸渚濊禆瀹夊叏鍩虹嚎绾冲叆榛樿 CI 涔嬪悗锛岀户缁€夋嫨涓€涓鐩栭潰骞裤€佷絾涓嶆繁鍏ュ崟涓骇鍝佹ā鍧楃殑 P0 鏀跺彛鐐癸紝鎶?release checklist 閲屽彛澶寸害瀹氱殑 secret scan 鍙樻垚浠撳簱鍐呭彲鎵ц銆佸彲鍥炲綊鐨勯粯璁ら棬绂併€?- 鏈疆鐩爣涓嶆槸鎵╁睍涓氬姟鑳藉姏锛岃€屾槸琛ラ綈榛樿 `verify:secrets` 鑴氭湰銆佽鎶ュ彲鎺х殑鎵弿瑙勫垯銆丆I 鎺ョ嚎锛屼互鍙婁笌涔嬮厤濂楃殑宸ョ▼鏂囨。鍚屾銆?
### 瀹為檯鍙樻洿

- 鏂板 `scripts/secret-scan-baseline.test.mjs`锛屽厛浠?RED 閿佸畾鍥涚被缂哄彛锛氫粨搴撶己灏?`verify:secrets` 鍛戒护銆乣ci` 鏈樉寮忔墽琛?secret scan銆丟itHub Actions 娌℃湁 secret scan 姝ラ锛屼互鍙?README / 寮€鍙戣鏄?/ release checklist 浠嶆妸 secret scan 璁版垚鎵嬪伐鍔ㄤ綔銆?- 鏂板 `scripts/verify-secret-scan.mjs`锛屾妸浠撳簱绾?secret scan 鏀跺彛涓哄崟涓€鍏ュ彛锛涘綋鍓嶄細鎵弿鏂囨湰鏂囦欢骞惰瘑鍒閽ュ潡銆佸父瑙?Token 鏍煎紡銆丏SN 鍐呰仈鍑嵁锛屼互鍙?`apiKey` / `secret` / `token` / `password` 涓€绫荤‖缂栫爜璧嬪€硷紝鍚屾椂璺宠繃 `node_modules`銆乣dist`銆乣coverage`銆侀攣鏂囦欢鍜屽父瑙佷簩杩涘埗璧勬簮銆?- 鎵弿鍣ㄤ负 `.env.example`銆佸紑鍙戞枃妗ｅ拰 release checklist 閲岀殑 placeholder 绀轰緥鍊煎缓绔嬩簡鍐呯疆蹇界暐瑙勫垯锛屽苟鏀寔閫氳繃 `secret-scan: allow` 瀵逛釜鍒祴璇曟牱渚嬪仛鏈€灏忚寖鍥磋眮鍏嶏紝閬垮厤鎶?`change-me-in-local-env`銆乣<secret-manager-value>`銆乣<local-password>` 绛夋紨绀哄€艰鍒ゆ垚鐪熷疄娉勬紡銆?- 鏇存柊鏍?`package.json`銆乣.github/workflows/ci.yml`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/planning/VERSION_PLAN.md`銆乣docs/planning/ROADMAP.md`銆乣docs/planning/versions/v1.0.0-release.md`銆乣docs/engineering/CODEX_PROJECT_CONTEXT.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛岀粺涓€鎶?release 璇存槑涓殑 secret scan 鏀跺彛涓?`npm run verify:secrets`锛屽苟娓呯悊鈥淐I 浠嶇己渚濊禆瀹¤鈥濊繖绫昏繃鏈熻〃杩般€?
### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/secret-scan-baseline.test.mjs`
- GREEN锛歚node --test scripts/secret-scan-baseline.test.mjs`
- `npm run verify:secrets`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 榛樿 CI 鐜板湪涓嶅啀鍙湪 release checklist 閲屸€滄彁閱掕鍋?secret scan鈥濓紝鑰屾槸浼氱洿鎺ユ墽琛?`npm run verify:secrets`锛涘悗缁嫢鏈変汉鎶婄閽ャ€佸凡鐭?Token 鏍煎紡鎴栨槑鏄剧殑纭紪鐮佸瘑閽ヨ祴鍊兼彁浜よ繘浠撳簱锛屼細鍏堝湪鏈湴鍜?CI 琚嫤涓嬨€?- 褰撳墠鍓╀綑鐨勫伐绋嬬骇 P0 璐ㄩ噺闂ㄧ涓昏鏀舵暃涓鸿鐩栫巼纭棬妲涗笌瑕嗙洊鐜囨眹鎬绘不鐞嗭紱secret scan 杩欐潯绾垮凡缁忎粠鈥滄墜宸ョ害瀹氣€濊浆鎴愨€滈粯璁ゅ彲鎵ц鍩虹嚎鈥濄€?## 2026-07-09 08:27:53 +08:00 | v1.1.0-alpha.138 | 鎺ㄨ繘 FE-041 鍏变韩 IconButton 涓庨鏋舵帴绾?### 浠诲姟鍐呭

- 缁х画娌库€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀鍋氭繁鍗曠偣鈥濈殑鑺傚鎺ㄨ繘 `FE-041`锛屼粠涓婁竴杞殑鍏变韩 `DataState / Drawer / Inspector` 鍐嶅悜鍓嶈蛋涓€姝ワ紝浼樺厛鏀跺彛瑕嗙洊闈㈠緢骞跨殑 `icon-button` 璇箟銆?- 鏈疆鐩爣鏄湪涓嶉噸鍐欓〉闈笟鍔＄殑鍓嶆彁涓嬶紝鎶婂叡浜?`IconButton` 钀藉埌 `@studymate/ui`锛屽苟鍏堟帴鍒伴《鏍忎笌鍥捐氨宸ヤ綔鍖鸿繖浜涢鏋剁骇涓昏矾寰勪笂銆?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/IconButton.tsx`锛屾妸 `icon-button` / `active` class 璇箟鏀跺彛涓哄叡浜?primitive锛屽苟榛樿灏嗗瓧绗︿覆 `title` 閫忎紶涓?`aria-label`锛岄伩鍏嶅浘鏍囨寜閽彧闈?hover 鏂囨鏆撮湶璇箟銆?- 鏇存柊 `packages/ui/src/index.ts` 涓?`packages/ui/src/Drawer.tsx`锛岃鍏变韩鍖呯洿鎺ュ鍑哄苟澶嶇敤 `IconButton`锛屽叡浜眰寮€濮嬪嚭鐜扮粍浠剁骇缁勫悎鍏崇郴銆?- 鏂板 `frontend-user/src/design-system/primitives/IconButton.tsx` 涓庡搴旀祴璇曪紝鐢ㄦ埛绔?now 鍙部鐢?design-system 鍏ュ彛娑堣垂鍏变韩瀹炵幇锛岃€屼笉蹇呯洿鎺ユ暎钀藉紩鐢ㄥ寘鍐呰矾寰勩€?- 鏇存柊 `frontend-user/src/app/chrome/CommandBar.tsx`銆乣modules/graph/components/GraphWorkspaceCanvasChrome.tsx`銆乣GraphWorkspaceShell.tsx`锛屾妸椤舵爮鎻愰啋/鐧诲嚭銆佸浘璋辫祫婧愪笌妫€鏌ュ櫒寮€鍏炽€佸浘璋卞伐鍏锋爮楂橀鍥炬爣鍔ㄤ綔缁熶竴鎺ュ埌鍏变韩 `IconButton`銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 鐨勭幇鐘舵帹杩涘埌鈥滃叡浜浘鏍囨寜閽凡琚涓鏋朵富璺緞鐪熷疄娑堣垂鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/IconButton.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
- `npm --workspace frontend-user run test -- src/design-system/primitives/IconButton.test.tsx src/design-system/primitives/Drawer.test.tsx src/app/layouts/AppShell.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx`

### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧鏄湪鍏变韩鈥滃鍣ㄧ粍浠垛€濆拰鈥滅姸鎬佽涔夆€濓紝涔熷紑濮嬫壙鎺ユ渶甯歌鐨勫姩浣滃瀷 primitive锛涘悗缁户缁敹鍙ｆ櫘閫氭寜閽€佸璇濇鍜?page-level actions 鏃讹紝璺緞浼氭槑鏄炬洿椤恒€?- 杩欒疆浠嶇劧鍙厛鎺ヤ簡椤舵爮鍜屽浘璋卞伐浣滃尯楠ㄦ灦锛岄槄璇汇€佺瑪璁般€佸涔犻〉闈㈤噷杩樺瓨鍦ㄨ嫢骞茬洿鎺ュ啓姝荤殑 `icon-button`锛涜繖浜涙洿閫傚悎缁х画娌垮悓涓€鍏变韩鍑哄彛閫愭鏇挎崲锛岃€屼笉鏄噸鏂拌璁′竴濂楁柊鎸夐挳浣撶郴銆?
## 2026-07-09 08:20:50 +08:00 | v1.1.0-alpha.137 | 鎺ㄨ繘 FE-041 鍏变韩鍩虹缁勪欢濂戠害绗竴鎵硅惤鍦?### 浠诲姟鍐呭

- 鎸夋柊鐨勫揩閫熷師鍨嬭妭濂忕户缁部 `CODEX_BACKLOG.md` 鎺ㄨ繘 `FE-041`锛屼粠鈥滃叡浜?token / 鏂囨 helper鈥濆啀寰€鍓嶈蛋涓€灏忔锛屽厛鏀跺彛宸茬粡绋冲畾瀛樺湪浜庣敤鎴风鐨?`DataState`銆乣Drawer`銆乣Inspector` 涓変釜鍩虹 primitive銆?- 鏈疆鐩爣鏄湪涓嶆敼鍔ㄩ〉闈㈣皟鐢ㄩ潰鐨勫墠鎻愪笅锛岃 `@studymate/ui` 鐪熸寮€濮嬫壙鎺ョ粍浠剁骇濂戠害锛屽苟閫氳繃 RED/GREEN 鎶婂叡浜寘涓庣敤鎴风鍏煎灞傞兘閿佽繘鍥炲綊閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/DataStateView.tsx`銆乣packages/ui/src/Drawer.tsx`銆乣packages/ui/src/Inspector.tsx`锛屾妸 `DataState`銆乣Drawer`銆乣Inspector` 鐨勬渶灏?React primitive 瀹炵幇娌夊埌鍏变韩鍖咃紝骞朵繚鐣欐棦鏈?`ds-*` class 璇箟銆?- 鏇存柊 `packages/ui/src/index.ts`锛岃 `@studymate/ui` 鐩存帴瀵煎嚭杩欎笁涓粍浠朵笌瀵瑰簲 props 绫诲瀷锛屼娇鍏变韩 UI 鍖呬笉鍐嶅彧鏆撮湶 token 鍜岀姸鎬?helper銆?- 鏂板 `packages/ui/src/reactPrimitives.test.tsx`锛屽厛鐢?RED 閿佸畾鍏变韩缁勪欢缂哄け瀵煎嚭锛屽啀鍦?GREEN 楠岃瘉 `DataState`銆乣Drawer`銆乣Inspector` 鐨勫熀纭€鍙闂€т笌鍏抽棴浜や簰銆?- 鏇存柊 `frontend-user/src/design-system/primitives/DataState.tsx`銆乣Drawer.tsx`銆乣Inspector.tsx`锛屽皢鐢ㄦ埛绔湰鍦板疄鐜版敹鍙ｄ负鍏煎杞彂灞傦紝淇濇寔鏃㈡湁 import 璺緞鍜屾祴璇曞叆鍙ｄ笉鍙樸€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 浠庘€滃叡浜姸鎬佸绾﹁捣姝モ€濇帹杩涘埌鈥滅涓€鎵瑰熀纭€缁勪欢濂戠害宸茶惤鍦扳€濄€?### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/index.test.ts packages/ui/src/reactPrimitives.test.tsx`
- `npm --workspace frontend-user run test -- src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx`

### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪宸茬粡涓嶅彧鏄?token 鍜岀姸鎬佹枃妗堝鍣紝鑰屾槸寮€濮嬫壙鎺ョ湡瀹炲叡浜?primitive锛涘悗缁户缁粺涓€ Button銆両nput銆丆onfirmDialog銆丆ommandBar 绛夌粍浠舵椂锛屽彲浠ユ部鐫€鍚屼竴鏉″叡浜嚭鍙ｇ户缁墿灞曘€?- 杩欎竴杞粛鐒跺彧瀹屾垚浜嗙涓€鎵规渶绋冲畾鐨勫熀纭€鏋勪欢锛岀鐞嗙涔熻繕娌℃湁鐩存帴娑堣垂杩欏眰缁勪欢鍑哄彛锛沗FE-041` 鍚庣画鏇村€煎緱缁х画鎺ㄨ繘鐨勬槸鏇村 primitives 鐨勬敹鍙ｏ紝鑰屼笉鏄噸鏂板湪椤甸潰灞傚鍒跺熀纭€鏋勪欢銆?
## 2026-07-09 08:08:00 +08:00 | v1.1.0-alpha.135 | 鏀跺彛宸ヤ綔鍖哄竷灞€棰勮涓庡鍑虹姸鎬?smoke
### 浠诲姟鍐呭

- 缁х画娌?`verify:graph-conflicts` 杩欐潯鍥哄畾鍏ュ彛鎺ㄨ繘 `WB-032/WB-034` 鐨勬渶灏忓閲忔敹鍙ｏ紝鎶婂浘璋卞伐浣滃尯 Playwright smoke 浠庘€滄闈?绐勫睆 + 鐪熷疄鐗堟湰鍐茬獊璺緞鈥濆啀琛ュ埌鈥滃竷灞€棰勮 API + 瀵煎嚭鐘舵€佲€濄€?- 鏈疆浠嶇劧涓嶆墿寮犲浘璋变笟鍔¤寖鍥达紝鍙ˉ鐪熷疄宸ヤ綔鍖洪噷宸茬粡瀛樺湪鐨勫竷灞€棰勮涓庡鍑哄弽棣堣矾寰勶紝璁╁浐瀹氬洖褰掑叆鍙ｆ洿鎺ヨ繎鐢ㄦ埛瀹為檯鎿嶄綔闂幆銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾鏂扮己鍙ｏ細褰撳墠 `e2e/v1-graph-workspace.spec.ts` 灏氭湭瑕嗙洊 `layouts/preview` 涓庝笁绉嶅鍑虹姸鎬佹枃妗堬紝鍥炲綊鐭╅樀鏂囨。涔熻繕娌℃湁鎶娾€滃竷灞€棰勮 / 瀵煎嚭鐘舵€佲€濈撼鍏?E2E 鎻忚堪銆?- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧炲浘璋卞伐浣滃尯甯冨眬棰勮涓庡鍑虹姸鎬?smoke锛氬湪鐪熷疄宸ヤ綔鍖洪噷閫夋嫨涓や釜鑺傜偣锛岃皟鐢?`/api/v1/graphs/graph-1/layouts/preview` 鐢熸垚鏉ユ簮娉抽亾锛屾柇瑷€璇锋眰浣撱€佹吵閬撳垎缁勬覆鏌擄紝浠ュ強 `瀵煎嚭 StudyMate JSON / SVG / PNG` 涓夌鐘舵€佹彁绀洪兘鑳藉湪椤甸潰涓婂彲瑙併€?- 鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛岀粺涓€鎶婂浘璋卞伐浣滃尯鍥哄畾 E2E 鍥炲綊鎻忚堪鎺ㄨ繘鍒扳€滄闈?绐勫睆 smoke + 甯冨眬棰勮 + 瀵煎嚭鐘舵€?+ 鐪熷疄 `graph_version_conflict` 璺緞鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm run test:graph:conflicts:e2e`
- `npm run verify:graph-conflicts`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `verify:graph-conflicts` 鐜板湪涓嶅彧瑕嗙洊鍥捐氨宸ヤ綔鍖虹殑鍔犺浇/淇濆瓨/瀵煎叆/鍘嗗彶涓庣増鏈啿绐佽矾寰勶紝涔熷紑濮嬪浐瀹氶獙璇佸竷灞€棰勮 API 鍜屼笁绉嶅鍑虹姸鎬佹彁绀猴紝鍚庣画缁х画琛?`WB-034` 鏃舵湁浜嗘洿璐磋繎鐪熷疄鎿嶄綔鐨?smoke 鍩哄骇銆?- 褰撳墠浠嶆湭瑕嗙洊鏇村畬鏁寸殑妗岄潰/绐勫睆缁勫悎鐭╅樀鍜屾潈闄愯矾寰勶紱鍚庣画搴旂户缁部杩欐潯鍥哄畾鍏ュ彛鎵╁睍锛岃€屼笉鏄噸鏂板垎鏁ｆ垚涓存椂鍛戒护銆?
## 2026-07-09 08:28:00 +08:00 | v1.1.0-alpha.136 | 鏀跺彛宸ヤ綔鍖烘潈闄愯矾寰?smoke
### 浠诲姟鍐呭

- 缁х画娌?`verify:graph-conflicts` 杩欐潯鍥哄畾鍏ュ彛鎺ㄨ繘 `WB-032/WB-034` 鐨勬渶灏忓閲忔敹鍙ｏ紝鎶婂浘璋卞伐浣滃尯鍥炲綊浠庘€滃啿绐併€佸竷灞€銆佸鍑衡€濆啀琛ュ埌鈥滄潈闄愯矾寰勨€濄€?- 鏈疆浠嶇劧涓嶆墿寮犲浘璋卞姛鑳斤紝鍙妸宸叉湁鍚庣 `forbidden` 鏉冮檺璇箟鎺ヨ繘椤电骇涓庣湡瀹炲伐浣滃尯 smoke锛屾墿澶у師鍨嬬殑鍏ㄥ眬鍙潬鎬ц鐩栭潰銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `scripts/graph-conflict-regression-baseline.test.mjs`锛屽厛鐢?RED 閿佸畾鏂扮己鍙ｏ細褰撳墠 `e2e/v1-graph-workspace.spec.ts` 灏氭湭瑕嗙洊 `forbidden` 鏉冮檺璺緞锛屽浐瀹氬洖褰掔煩闃佃櫧鐒舵彁鍒版潈闄愬叏鐭╅樀锛屼絾杩樻病鏈夌湡姝ｈ惤鍒?smoke銆?- 鏇存柊 `frontend-user/src/modules/graph/GraphWorkspacePage.test.tsx`锛岃ˉ椤电骇鍥炲綊锛氬垏鎹㈠埌鏃犳潈闄愬浘璋卞け璐ユ椂锛屽簲鏄剧ず鈥滃彧鑳借闂嚜宸辩殑鍥捐氨鈥濓紝骞朵繚鎸佸綋鍓嶅浘璋辩户缁彲鐢ㄣ€?- 鏇存柊 `e2e/v1-graph-workspace.spec.ts`锛屾柊澧炵湡瀹炲伐浣滃尯鏉冮檺璺緞 smoke锛氬綋璧勬簮闈㈡澘閲屽垏鍒拌繑鍥?`403 forbidden` 鐨勫浘璋辨椂锛岄〉闈㈤渶瑕佺粰鍑洪敊璇彁绀猴紝鍚屾椂淇濇寔褰撳墠鍥捐氨鏍囬銆佽妭鐐逛笌鐘舵€佹爮涓嶈鐮村潖銆?- 鏇存柊 `docs/engineering/GRAPH_CONFLICT_REGRESSION.md`銆乣README.md`銆乣docs/DEVELOPMENT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛岀粺涓€鎶婂浘璋卞伐浣滃尯鍥哄畾鍥炲綊鎻忚堪鎺ㄨ繘鍒扳€滃竷灞€棰勮/瀵煎嚭鐘舵€?+ 鏉冮檺璺緞 + 鐪熷疄鍐茬獊澶勭悊鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- GREEN锛歚node --test scripts/graph-conflict-regression-baseline.test.mjs`
- `npm --workspace frontend-user run test -- src/modules/graph/GraphWorkspacePage.test.tsx`
- `npm run test:graph:conflicts:e2e`
- `npm run verify:graph-conflicts`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `verify:graph-conflicts` 鐜板湪闄や簡鍐茬獊銆佸竷灞€鍜屽鍑轰箣澶栵紝涔熷紑濮嬪浐瀹氶獙璇佸浘璋卞伐浣滃尯鐨勬潈闄愬け璐ヨ矾寰勶紝涓哄悗缁?`WB-034` 缁х画琛ユ潈闄愬垎鏀煩闃垫彁渚涗簡绋冲畾鍩哄骇銆?- 褰撳墠浠嶆湭瑕嗙洊鏇村畬鏁寸殑鏉冮檺缁勫悎锛屾瘮濡傚垱寤?淇濆瓨/鎭㈠/瀵煎嚭鍦ㄤ笉鍚屾潈闄愯鑹蹭笅鐨勬洿澶氬垎鏀紱鍚庣画浠嶅簲娌胯繖鏉″浐瀹氬叆鍙ｆ墿灞曪紝鑰屼笉鏄噸鏂板垎鏁ｆ垚涓存椂鍛戒护銆?## 2026-07-09 08:41:12 +08:00 | v1.1.0-alpha.139 | 鎺ㄨ繘 FE-041 鍏变韩 Button 鍥捐氨鎺ョ嚎
### 浠诲姟鍐呭

- 娌跨潃 `FE-041` 宸茬粡钀藉湴鐨勫叡浜?`DataState / Drawer / Inspector / IconButton` 缁х画寰€鍓嶆帹杩涗竴灏忔锛岃繖涓€杞仛鐒︽渶甯歌鐨勬櫘閫氬姩浣滄寜閽紝鑰屼笉鏄户缁彧鍋滅暀鍦ㄥ浘鏍囨寜閽眰銆?- 鏈疆鐩爣鏄湪涓嶉噸鍐欏浘璋变笟鍔＄殑鍓嶆彁涓嬶紝鎶?`primary-button` / `secondary-button` / `ghost-button` 鐨勫熀纭€璇箟鍏堟敹鍙ｅ埌鍏变韩 `Button`锛屽苟浼樺厛鎺ュ埌鍥捐氨宸ヤ綔鍖鸿繖鏉＄湡瀹炰富璺緞涓娿€?
### 瀹為檯鍙樻洿

- 鏂板 `packages/ui/src/Button.tsx`锛岀粺涓€鎻愪緵 `primary`銆乣secondary`銆乣ghost` 涓夌鍙樹綋锛屽苟鏀跺彛 `active`銆乣danger`銆侀粯璁?`type="button"` 绛夊熀纭€琛屼负銆?- 鏇存柊 `packages/ui/src/index.ts`锛岃 `@studymate/ui` 姝ｅ紡瀵煎嚭 `Button`銆乣ButtonProps` 涓?`ButtonVariant`銆?- 鏂板 `frontend-user/src/design-system/primitives/Button.tsx` 涓庡吋瀹瑰鍑猴紝璁╃敤鎴风椤甸潰灞傜户缁部鐢ㄦ湰鍦?design-system 璺緞娑堣垂鍏变韩瀹炵幇銆?- 鏇存柊 `frontend-user/src/design-system/primitives/index.ts`锛屾妸鍏变韩 `Button` 绾冲叆缁熶竴 primitive 鍑哄彛銆?- 鏇存柊 `frontend-user/src/modules/graph/components/GraphWorkspaceCanvasChrome.tsx`銆乣GraphWorkspaceShell.tsx`銆乣GraphWorkspaceImportPanel.tsx`銆乣GraphWorkspaceStageChrome.tsx`锛屾妸鍥捐氨宸ヤ綔鍖洪噷鐨勬柊寤恒€佷繚瀛樸€佸鍏ャ€佹牎楠屻€佸啿绐佸鐞嗙瓑鏅€氬姩浣滄寜閽帴鍒板叡浜?`Button`锛屽悓鏃朵繚鐣欑幇鏈夐〉闈㈣涔変笌鍙闂€с€?- 鏂板 `frontend-user/src/design-system/primitives/Button.test.tsx`锛屽苟鎵╁睍 `packages/ui/src/reactPrimitives.test.tsx`锛岀敤 RED/GREEN 閿佸畾鍏变韩瀵煎嚭銆佹寜閽彉浣撱€乣active`/`danger` 鐘舵€併€佺偣鍑昏涓轰笌榛樿鎸夐挳绫诲瀷銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 鐜扮姸鎺ㄨ繘鍒扳€滄櫘閫氬姩浣滄寜閽篃宸插紑濮嬭蛋鍏变韩 primitive 鍑哄彛鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- RED锛歚npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx`
- GREEN锛歚npx vitest run packages/ui/src/reactPrimitives.test.tsx`
- `npm --workspace frontend-user run test -- src/design-system/primitives/Button.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/modules/graph/components/GraphWorkspaceShell.test.tsx src/modules/graph/components/GraphWorkspaceImportPanel.test.tsx src/modules/graph/components/GraphWorkspaceStageChrome.test.tsx`
- `npm run typecheck`
- `npm run build:user`

### 鍚庣画褰卞搷

- `@studymate/ui` 鐜板湪涓嶅啀鍙壙鎺ョ姸鎬佺粍浠跺拰鍥炬爣鎸夐挳锛屼篃寮€濮嬫壙鎺ユ櫘閫氬姩浣滄寜閽繖绫绘洿楂橀鐨勪氦浜?primitive锛涘悗缁户缁敹鍙?Input銆丼elect銆乀ag銆丆onfirmDialog銆丆ommandBar 鏃讹紝鍙互娌跨潃鍚屼竴鏉″彉浣撹涔夌户缁墿灞曘€?- 杩欎竴杞粛鐒跺彧鍏堟帴浜嗗浘璋卞伐浣滃尯锛岄槄璇汇€佺瑪璁般€佸涔犱笌绠＄悊绔噷鏁ｈ惤鐨勬櫘閫氭寜閽繕娌℃湁缁熶竴杩佸叆鍏变韩鍑哄彛锛沗FE-041` 涓嬩竴姝ユ洿閫傚悎缁х画鎸夌湡瀹為〉闈富璺緞閫愭鏇挎崲锛岃€屼笉鏄噸鏂拌璁′竴濂楁柊鎸夐挳浣撶郴銆?## 2026-07-09 10:33:52 +08:00 | v1.1.0-alpha.143 | 鎺ㄨ繘 FE-041 绠＄悊绔鏍稿姩浣滄帴鍏ョ‘璁ゅ眰
### 浠诲姟鍐呭

- 缁х画娌?`FE-041` 鐨勫叡浜氦浜掕涔夋敹鍙ｏ紝涓嶅洖澶存繁鎸栧崟涓€鍥捐氨鑳藉姏锛岃€屾槸鎶婄‘璁ゆ祦绋嬫帹杩涘埌鍚庡彴娌荤悊杩欐潯鐪熷疄楂橀涓昏矾寰勩€?- 鏈疆鐩爣鏄绠＄悊绔鏍搁槦鍒楅噷鐨勨€滈€氳繃 / 椹冲洖 / 闅愯棌鈥濆厛杩涘叆纭灞傦紝鍐嶆墽琛屽師鏈夊鏍稿姩浣滐紝褰㈡垚璺ㄥ墠鍚庡彴鏇翠竴鑷寸殑 destructive/action 澶勭悊鑺傚銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminConfirmDialog.vue`锛屾彁渚?Vue 渚у彲澶嶇敤鐨勫悗鍙扮‘璁ゅ眰锛岀粺涓€鎵挎帴鏍囬銆佽鏄庛€佸彇娑?纭銆佸嵄闄╁姩浣溿€佺‘璁や腑绂佺敤鍜岄敊璇彁绀恒€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屾妸瀹℃牳闃熷垪閲岀殑鈥滈€氳繃 / 椹冲洖 / 闅愯棌鈥濅粠鐩存帴鎵ц鏀逛负鍏堟墦寮€纭灞傦紱鍙栨秷鏃朵笉鍙戣姹傦紝纭鍚庢墠璋冪敤 `/api/v1/admin/moderation/.../:action`銆?- 鏇存柊 `frontend-admin/src/components/admin/admin.css`锛岃ˉ榻愬悗鍙扮‘璁ゅ眰鐨勯伄缃┿€侀潰鏉裤€佸嵄闄╃‘璁ゆ寜閽拰閿欒鎻愮ず鏍峰紡锛屽苟椤烘墜鍘绘帀鐧诲綍椤甸噸澶嶆彁绀烘枃妗堛€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屾柊澧?RED/GREEN 椤甸潰绾у洖褰掞紝閿佸畾鈥滈┏鍥炲姩浣滃厛纭銆佸彇娑堜笉瑙﹀彂璇锋眰銆佺‘璁ゅ悗鎼哄甫鍚庡彴 token 鍙戣捣 POST鈥濈殑濂戠害銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 鐨勫綋鍓嶈竟鐣屾帹杩涘埌鈥滅鐞嗙瀹℃牳鍔ㄤ綔涔熷凡杩涘叆纭灞傗€濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 绠＄悊绔鏍稿姩浣滅幇鍦ㄥ凡缁忓紑濮嬫部鐢ㄦ埛绔?`ConfirmDialog` 鐨勫悓涓€濂楃‘璁よ涔夋敹鍙ｏ紝鍚庣画缁х画鎺ㄨ繘鍚庡彴娌荤悊閲岀殑涓嬫灦銆佹仮澶嶃€侀噸璇曠瓑鍔ㄤ綔鏃讹紝鍙互鐩存帴娌胯繖灞傛ā寮忔墿灞曘€?- 褰撳墠纭鐘舵€佷粛鎸傚湪 `AdminWorkspaceView.vue` 鍗曞伐浣滃彴缁勪欢鍐咃紱鍚庣画鑻ユ帹杩?`ADM-010 / ADM-011`锛屾洿閫傚悎鎶婅繖绫绘不鐞嗗姩浣滀笌纭鐘舵€佷竴璧蜂笅娌夊埌妯″潡椤垫垨 feature 杈圭晫銆?## 2026-07-09 11:10:00 +08:00 | v1.1.0-alpha.146 | 鎺ㄨ繘 ADM-010 绠＄悊绔櫥褰曡鍥句笌宸茬櫥褰曞３灞傛娊绂?### 浠诲姟鍐呭

- 鍦?`ADM-010` 宸插畬鎴?URL 鐘舵€佸拰棣栨壒妯″潡瑙嗗浘鎷嗗垎鐨勫熀纭€涓婏紝缁х画鍋氫竴涓皬鑰岀ǔ瀹氱殑鍚庡彴鍒嗗眰鏀跺彛锛岄伩鍏?`AdminWorkspaceView.vue` 鍚屾椂鎸佹湁鐧诲綍椤甸潰銆佷晶鏍忋€侀《閮ㄧ姸鎬佹潯銆佹爣棰樺尯鍜屾ā鍧楀唴瀹广€?- 鏈疆鐩爣涓嶆槸鍒囧埌鐪熸鐨?Vue Router page锛岃€屾槸鍏堟妸鈥滅櫥褰曟€佽鍥锯€濆拰鈥滃凡鐧诲綍澹冲眰鈥濅粠宸ヤ綔鍙板崗璋冨櫒涓墺绂诲嚭鏉ワ紝璁╁悗鍙板崟椤靛伐浣滃彴缁х画寰€鍙淮鎶ょ殑澶氬眰缁撴瀯杩囨浮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminLoginPanel.vue`锛屾壙鎺ュ悗鍙扮櫥褰曞搧鐗屽尯銆佽〃鍗曡緭鍏ャ€侀敊璇彁绀哄拰鎻愪氦浜や簰銆?- 鏂板 `frontend-admin/src/components/admin/AdminShellFrame.vue`锛屾壙鎺ュ悗鍙颁晶鏍忓鑸€侀《閮ㄧ姸鎬佹潯銆侀〉闈㈡爣棰樺尯銆侀€氱煡鍖哄拰榛樿鍐呭鎻掓Ы銆?- 鏂板 `frontend-admin/src/components/admin/AdminLoginPanel.test.ts` 涓?`AdminShellFrame.test.ts`锛屽厛浠?RED 澶嶇幇缁勪欢缂哄け锛屽啀鍦?GREEN 閿佸畾鐧诲綍杈撳叆鏇存柊/鎻愪氦濂戠害锛屼互鍙婂３灞傚鑸€佸埛鏂般€侀€€鍑轰簨浠惰竟鐣屻€?- 閲嶅啓 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃瀹冭繘涓€姝ュ洖鍒?session銆乁RL銆佸鏍哥‘璁ゅ眰鍜屾暟鎹姞杞藉崗璋冨櫒瑙掕壊锛涙枃浠惰妯′粠 536 琛岄檷鍒?497 琛屻€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-010` 鐨勬渶鏂拌竟鐣屾帹杩涘埌鈥滅櫥褰曡鍥?+ 宸茬櫥褰曞３灞?+ 妯″潡瑙嗗浘鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/components/admin/AdminLoginPanel.test.ts src/components/admin/AdminShellFrame.test.ts`
- `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍚庡彴宸ヤ綔鍙扮幇鍦ㄥ凡缁忓叿澶囨洿娓呮櫚鐨勪笁灞傜粨鏋勶細鐧诲綍瑙嗗浘銆佸凡鐧诲綍澹冲眰鍜屾ā鍧楄鍥撅紱鍚庣画缁х画鎷?users / materials / ai / audit 鏃讹紝涓嶉渶瑕佸啀鎶婅繖浜涘３灞傜粨鏋勯噸澶嶅啓鍥?`AdminWorkspaceView.vue`銆?- 褰撳墠鏁版嵁鍔犺浇鍜屾不鐞嗗姩浣滀粛闆嗕腑鍦ㄥ崗璋冨櫒灞傦紱鍚庣画鑻ョ户缁帹杩?`ADM-010 / ADM-011`锛屾洿閫傚悎鎶婃ā鍧楀唴鏁版嵁杈圭晫銆佸姩浣滅姸鎬佸拰瀹¤璇箟缁х画娌夊埌 page / feature 绾у埆銆?
## 2026-07-09 11:02:00 +08:00 | v1.1.0-alpha.145 | 鎺ㄨ繘 ADM-010 绠＄悊绔鎵规ā鍧楄鍥炬媶鍒?### 浠诲姟鍐呭

- 鍦?`ADM-010` 宸插畬鎴?URL 璺敱璧锋鐨勫熀纭€涓婏紝缁х画鍋氫竴涓渶灏忋€佸彲娴嬭瘯鐨勫悗鍙版ā鍧楀寲鏀跺彛锛岄伩鍏?`AdminWorkspaceView.vue` 鍐嶇户缁惛绾?dashboard銆乵oderation 鍜屾不鐞嗗垪琛ㄧ殑鏁村潡妯℃澘銆?- 鏈疆鐩爣涓嶆槸涓€娆℃€у畬鎴愮湡姝ｇ殑 Vue Router page 鎷嗗垎锛岃€屾槸鍏堟妸鏈€楂橀鐨勪笁鍧楀睍绀哄眰鎶芥垚鐙珛妯″潡瑙嗗浘锛岃鍚庡彴宸ヤ綔鍙板紑濮嬪洖鍒扳€渟ession / URL / 纭灞傚３缁勪欢鈥濈殑鑱岃矗銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/modules/AdminDashboardModule.vue`銆乣frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛屽垎鍒壙鎺ユ瑙堟寚鏍囧崱銆佸鏍搁槦鍒楄〃鏍煎拰娌荤悊璁板綍/鎽樿/璇︽儏灞曠ず銆?- 鏂板 `frontend-admin/src/views/modules/AdminDashboardModule.test.ts`銆乣frontend-admin/src/views/modules/AdminModerationModule.test.ts` 涓?`frontend-admin/src/views/modules/AdminGovernanceModule.test.ts`锛屽厛浠?RED 澶嶇幇鈥滄ā鍧楁枃浠朵笉瀛樺湪鈥濈殑缂哄彛锛屽啀鍦?GREEN 閿佸畾妯″潡娓叉煋銆佹煡璇㈣緭鍏ュ拰浜嬩欢鍙戝皠濂戠害銆?- 閲嶅啓 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃宸ヤ綔鍙颁富瑙嗗浘鏀逛负缁勫悎 session銆乁RL銆佸鏍哥‘璁ゅ眰涓庢ā鍧楀垏鎹紝涓嶅啀缁х画鍐呰仈 dashboard / moderation / governance 鐨勫畬鏁撮〉闈㈢粨鏋勩€?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-010` 浠庘€滃彧鏈?URL 鐘舵€佲€濇帹杩涘埌鈥淯RL + 棣栨壒妯″潡瑙嗗浘鎷嗗垎鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 鍚庡彴宸ヤ綔鍙扮幇鍦ㄥ凡缁忎笉鍐嶅彧鏈?URL 璺敱鑳藉姏锛屼篃寮€濮嬪叿澶囬鎵规ā鍧楃骇瑙嗗浘杈圭晫锛涘悗缁户缁媶 users / materials / ai / audit 鏃讹紝鍙互娌?`src/views/modules/` 杩欏眰妯″紡缁х画鎺ㄨ繘锛岃€屼笉鏄妸鏁撮〉妯℃澘缁х画鍫嗗洖 `AdminWorkspaceView.vue`銆?- 褰撳墠鏁版嵁鍔犺浇鍜屾不鐞嗗姩浣滀粛闆嗕腑鍦ㄥ３缁勪欢閲岋紱鍚庣画鑻ョ户缁帹杩?`ADM-010 / ADM-011`锛屾洿閫傚悎鎶婃ā鍧楁暟鎹竟鐣屻€佸姩浣滅姸鎬佸拰瀹¤璇箟涓€璧蜂笅娌夊埌 page / feature 绾у埆銆?
## 2026-07-09 10:47:30 +08:00 | v1.1.0-alpha.144 | 鎺ㄨ繘 ADM-010 绠＄悊绔?URL 璺敱璧锋
### 浠诲姟鍐呭

- 閬靛惊鈥滃厛鎶婃暣浣撳伐浣滃彴鍋氬畬鏁达紝鍐嶉€愭娣卞叆鈥濈殑鍘熷瀷鑺傚锛屼紭鍏堟帹杩涚鐞嗙鐨勫彲鍒锋柊銆佸彲鐩磋揪銆佸彲鍥為€€鑳藉姏锛岃€屼笉鏄户缁彧鍦ㄥ崟涓不鐞嗗姩浣滀笂鎵撹ˉ涓併€?- 鏈疆鐩爣鏄鍚庡彴妯″潡鍒囨崲鎷ユ湁鐪熷疄 `/admin/...` URL锛屽苟璁╅粯璁ゅ叆鍙ｃ€佸鑸垏鎹㈠拰娴忚鍣ㄥ墠杩?鍚庨€€閮借兘鍥炲埌姝ｇ‘妯″潡銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/router/index.ts`锛屾妸鍘熷厛鍙繚瀛?route key 鐨勬枃浠跺崌绾т负鍚庡彴妯″潡璺緞鏄犲皠灞傦紝鎻愪緵 `/admin/dashboard`銆乣/admin/moderation`銆乣/admin/users`銆乣/admin/audit` 绛夎矾寰勭殑瑙ｆ瀽銆佺敓鎴愬拰榛樿褰掍竴鍖栥€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃绠＄悊绔伐浣滃彴鎸夋祻瑙堝櫒璺緞鍐冲畾鍒濆妯″潡锛屽苟鍦ㄥ鑸垏鎹€佹牴璺緞褰掍竴鍖栥€佹祻瑙堝櫒 `popstate`銆佷細璇濆け鏁堝拰鎵嬪姩閫€鍑烘椂鍚屾 URL 涓庡伐浣滃彴鐘舵€併€?- 鏇存柊 `frontend-admin/src/App.test.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屽厛鐢?RED 閿佸畾鈥滄牴璺緞涓嶄細褰掍竴鍖栤€濆拰鈥滃垏鎹㈡ā鍧椾笉鏀瑰湴鍧€鈥濈殑缂哄彛锛屽啀鐢?GREEN 鍥哄畾鏈€灏?URL 璺敱濂戠害锛涘悓鏃惰ˉ浜嗘祴璇曢棿 URL 鐘舵€侀殧绂伙紝閬垮厤鍘嗗彶璺緞涓叉壈銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-010` 浠庣函寰呭仛鎺ㄨ繘鍒扳€淯RL 璺敱璧锋宸茶惤鍦帮紝浣嗗皻鏈媶鎴愮嫭绔嬫ā鍧楅〉鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm --workspace frontend-admin run test -- src/App.test.ts src/views/AdminWorkspaceView.test.ts src/api/client.test.ts`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- 绠＄悊绔幇鍦ㄥ凡缁忓叿澶囩湡瀹?URL 宸ヤ綔鍙扮殑鏈€灏忓舰鎬侊紝鍚庣画琛ュ悗鍙版不鐞嗗姩浣溿€佹ā鍧楁媶椤靛拰瀹¤娴佹椂锛屽彲浠ョ洿鎺ユ部 `/admin/...` 璺緞缁х画鎵╁睍銆?- 褰撳墠椤甸潰浠嶉泦涓湪 `AdminWorkspaceView.vue` 鍐呴儴鍒囨崲锛涘悗缁帹杩?`ADM-010 / ADM-011` 鏃讹紝鏇撮€傚悎鎶?users銆乵oderation銆乤i銆乤udit 绛夋ā鍧楅€愭鎷嗗埌鐙珛椤甸潰鍜?feature 杈圭晫銆?## 2026-07-09 12:25:00 +08:00 | v1.1.0-alpha.150 | 鎺ㄨ繘 ADM-011 鐢ㄦ埛娌荤悊鍔ㄤ綔璧锋
### 浠诲姟鍐呭

- 缁х画娌?`ADM-011` 鍋氣€滃厛鎶婂悗鍙版不鐞嗕富璺緞琛ラ綈鈥濈殑灏忔鎺ㄨ繘锛岃繖涓€杞粠 AI 浠诲姟娌荤悊缁х画鎵╁埌鐢ㄦ埛娌荤悊锛屼笉鍥炲ご娣辨寲宸叉湁涓炬姤 / 璧勬枡 / AI 瀛愬煙銆?- 鏈疆鐩爣鏄妸鐢ㄦ埛娌荤悊鍒楄〃浠庡彧璇绘帹杩涘埌鏈€灏忓彲鎵ц娌荤悊锛氭椿璺冪敤鎴峰彲绂佺敤锛屽凡绂佺敤鐢ㄦ埛鍙仮澶嶏紝骞惰琚鐢ㄨ处鍙峰湪璁よ瘉閾捐矾閲岀湡瀹炲け鏁堬紝鑰屼笉鏄彧鍋滅暀鍦ㄥ悗鍙板睍绀虹姸鎬併€?
### 瀹為檯鍙樻洿

- 鏂板 `backend/internal/modules/admin/service/user_actions_test.go`锛屽厛鐢?RED 閿佸畾涓変釜缂哄彛锛歚HandleUser(...)` 灏氫笉瀛樺湪銆佺敤鎴锋不鐞嗚繕娌℃湁 `disable / activate` 鍔ㄤ綔銆佸悗鍙颁篃杩樹笉浼氫负杩欎簺鍔ㄤ綔鍐欏叆瀹¤鏃ュ織銆?- 鏂板 `backend/internal/modules/auth/service/status_guard_test.go`锛屽厛鐢?RED 閿佸畾琚鐢ㄧ敤鎴蜂粛鍙?`Login(...)` / `Refresh(...)` 鐨勮璇佺己鍙ｏ紝閬垮厤鍙妸鐢ㄦ埛鐘舵€佸仛鎴愨€滃悗鍙板垪琛ㄥ瓧娈碘€濄€?- 鏇存柊 `backend/internal/modules/admin/service/service.go`銆乣handler/handler.go` 涓?`router/router.go`锛岃ˉ榻?`HandleUser(...)`銆乣/api/v1/admin/users/:id/disable` 涓?`/api/v1/admin/users/:id/activate`锛涘綋鍓嶅師鍨嬭涔夋槸 `active <-> disabled`锛屽苟鍦ㄥ悓涓€浜嬪姟鍐呭啓鍏?`admin.handle.user` 瀹¤浜嬩欢锛屽悓鏃朵繚鎶ょ鐞嗗憳璐﹀彿涓嶅湪杩欐潯棣栧垏鐗囬噷琚洿鎺ョ鐢ㄣ€?- 鏇存柊 `backend/internal/modules/user/model/user.go` 涓?`backend/internal/modules/auth/service/service.go`锛岃鐢ㄦ埛妯″瀷鏄惧紡鎵挎帴 `status` 瀛楁锛屽苟鍦ㄧ櫥褰?/ 鍒锋柊闃舵瀵?`disabled` 璐﹀彿杩斿洖 `user_disabled`锛岃绂佺敤鍔ㄤ綔瀵圭湡瀹炰細璇濈敓鍛藉懆鏈熷紑濮嬬敓鏁堛€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃鐢ㄦ埛娌荤悊妯″潡鎸夎褰曠姸鎬佹樉绀衡€滅鐢ㄧ敤鎴?/ 鎭㈠鐢ㄦ埛鈥濓紝鍏堣繘鍏ョ‘璁ゅ眰锛屽啀鎻愪氦 `/api/v1/admin/users/:id/:action`銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-011` 浠庘€滀妇鎶?+ 璧勬枡 + AI鈥濅笁娈靛垏鐗囨帹杩涘埌鈥滀妇鎶?+ 璧勬枡 + AI + 鐢ㄦ埛鈥濆洓娈电湡瀹炴不鐞嗗垏鐗囥€?
### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service ./internal/modules/auth/service`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚go test ./internal/modules/admin/service ./internal/modules/auth/service`
- `go test ./internal/modules/admin/... ./internal/modules/auth/...`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- 鍚庡彴鈥滅敤鎴锋不鐞嗏€濈幇鍦ㄥ凡缁忎粠鍙璁板綍鎺ㄨ繘鍒版渶灏忓彲鎵ц鍔ㄤ綔锛屼笖绂佺敤鐘舵€佸紑濮嬭繘鍏ヨ璇侀摼璺紝涓嶅啀鍙槸杩愯惀瑙嗗浘閲岀殑灞曠ず瀛楁锛涘悗缁户缁ˉ浼氳瘽鍗虫椂澶辨晥銆佹洿澶氭潈闄愯竟鐣屽拰瀹¤鏌ヨ鏃讹紝浼氭瘮鐜板湪鏇撮『銆?- 褰撳墠鐢ㄦ埛娌荤悊浠嶅厛鏀跺彛鍦ㄢ€滅鐢?/ 鎭㈠ + login/refresh 鎷掔粷鈥濊繖涓€灞傦紝灏氭湭瀵瑰凡绛惧彂 access token 鍋氬嵆鏃舵嫤鎴紱鍚庣画鑻ョ户缁帹杩?`ADM-010 / ADM-011`锛屾洿閫傚悎鎶婅祫鏂欍€佺敤鎴枫€丄I銆佸璁″姩浣滅户缁線 page / feature 灞備笅娌夛紝骞跺啀鍐冲畾鏄惁琛ヤ腑闂翠欢绾х姸鎬佹牎楠屻€?## 2026-07-09 12:45:00 +08:00 | v1.1.0-alpha.151 | 鎺ㄨ繘 ADM-011 鍥捐氨妯℃澘娌荤悊璧锋
### 浠诲姟鍐呭

- 缁х画娌?`ADM-011` 鍋氣€滃厛鎶婂悗鍙版不鐞嗕富璺緞琛ラ綈鈥濈殑灏忔鎺ㄨ繘锛岃繖涓€杞粠鐢ㄦ埛娌荤悊缁х画鎵╁埌鍥捐氨妯℃澘娌荤悊锛屼笉鍥炲ご娣辨寲宸叉湁涓炬姤 / 璧勬枡 / AI / 鐢ㄦ埛瀛愬煙銆?- 鏈疆鐩爣鏄妸鍚庡彴 `graph` 妯″潡浠庢爣绛惧崰浣嶅垪琛ㄦ帹杩涘埌鐪熷疄妯℃澘娌荤悊锛氳鍙栫郴缁熸ā鏉跨洰褰曘€佹帴鍏?`diagram_templates` 鐘舵€佽鐩栵紝骞惰鍚庡彴 `publish / unpublish` 鐩存帴褰卞搷鐢ㄦ埛绔ā鏉垮彲瑙佹€с€?### 瀹為檯鍙樻洿

- 鏂板 `backend/internal/modules/admin/service/diagram_templates_test.go` 涓?`backend/internal/modules/graph/service/diagram_templates_test.go`锛屽厛鐢?RED 閿佸畾涓変釜缂哄彛锛氬悗鍙拌繕娌℃湁妯℃澘娌荤悊鏈嶅姟銆佸悗鍙?`graph` 妯″潡浠嶅湪璇诲彇 `/api/v1/admin/tags`銆佺敤鎴风 `/api/v1/diagram/templates` 杩樹笉浼氭寜鍚庡彴鍙戝竷鐘舵€佽繃婊ゃ€?- 鏂板 `backend/internal/modules/graph/dto/template_catalog.go` 涓?`backend/internal/modules/graph/repository/diagram_templates.go`锛屾妸绯荤粺鍥捐氨妯℃澘鐩綍鏀跺彛鎴愬叡浜?catalog锛屽苟缁?`diagram_templates` 琛ㄨˉ涓婅鍐欑姸鎬佽鐩栫殑 repository 鑳藉姏銆?- 鏇存柊 `backend/internal/modules/admin/service/service.go`銆乣handler/handler.go` 涓?`router/router.go`锛岃ˉ榻?`/api/v1/admin/diagram-templates`銆乣/api/v1/admin/diagram-templates/:id/publish` 涓?`/api/v1/admin/diagram-templates/:id/unpublish`锛涘悗鍙扮幇鍦ㄤ細鎶婄郴缁熸ā鏉跨洰褰曚笌鎸佷箙鍖栫姸鎬佸悎骞舵垚鐪熷疄娌荤悊鍒楄〃锛屽苟涓?`publish / unpublish` 鍐欏叆 `admin.handle.diagram_template` 瀹¤浜嬩欢銆?- 鏇存柊 `backend/internal/modules/graph/service/service.go`锛岃鐢ㄦ埛绔?`/api/v1/diagram/templates` 鍙繑鍥炲凡鍙戝竷妯℃澘锛涜鍚庡彴涓嬫灦鐨勬ā鏉夸細鐩存帴浠庣敤鎴风妯℃澘鍒楄〃闅愯棌銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屾妸鍚庡彴 `graph` 妯″潡浠?`/api/v1/admin/tags` 鍒囧埌鐪熷疄 `/api/v1/admin/diagram-templates`锛屽苟鍔犲叆妯℃澘 `publish / unpublish` 鐨勭‘璁ゆ祦銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_PROJECT_CONTEXT.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ADM-011` 浠庘€滀妇鎶?+ 璧勬枡 + AI + 鐢ㄦ埛鈥濆洓娈靛垏鐗囨帹杩涘埌鈥滀妇鎶?+ 璧勬枡 + AI + 鐢ㄦ埛 + 鍥捐氨妯℃澘鈥濅簲娈电湡瀹炴不鐞嗗垏鐗囥€?### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service ./internal/modules/graph/service`
- RED锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚go test ./internal/modules/admin/service ./internal/modules/graph/service`
- `go test ./internal/modules/admin/... ./internal/modules/graph/...`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`

### 鍚庣画褰卞搷

- 鍚庡彴鈥滃浘璋辨ā鏉挎不鐞嗏€濈幇鍦ㄥ凡缁忎粠鏍囩鍗犱綅椤垫帹杩涘埌鏈€灏忓彲鎵ц妯″潡锛屽苟涓斿彂甯冪姸鎬佸紑濮嬬湡瀹炲奖鍝嶇敤鎴风妯℃澘鍒楄〃锛涘悗缁户缁ˉ妯℃澘澶囨敞銆佺増鏈€佺敤鎴疯嚜瀹氫箟妯℃澘鍜?preview 璧勪骇娌荤悊鏃讹紝浼氭瘮鐜板湪鏇撮『銆?- 褰撳墠妯℃澘娌荤悊鍔ㄤ綔浠嶉泦涓湪 `AdminWorkspaceView.vue` 鍗忚皟锛涘悗缁嫢缁х画鎺ㄨ繘 `ADM-010 / ADM-011`锛屾洿閫傚悎鎶婃ā鏉裤€佽祫鏂欍€佺敤鎴枫€丄I銆佸璁＄瓑鍔ㄤ綔缁х画寰€ page / feature 灞備笅娌夈€?## 2026-07-09 12:45:00 +08:00 | v1.1.0-alpha.151 | 鎺ㄨ繘 ADM-011 鐢ㄦ埛浼氳瘽鍗虫椂澶辨晥涓庢潈闄愯竟鐣岃ˉ寮?### 浠诲姟鍐呭

- 鍦?`ADM-011` 宸插畬鎴愮敤鎴?`disable / activate` 鏈€灏忔不鐞嗗垏鐗囩殑鍩虹涓婏紝缁х画琛ョ湡姝ｄ細褰卞搷杩愯涓細璇濈殑瀹夊叏杈圭晫锛屼笉璁┾€滃凡绂佺敤璐﹀彿鎷挎棫 token 缁х画璁块棶鈥濇垚涓洪粯璁よ涓恒€?- 鏈疆鐩爣鏄敹鍙ｄ袱鏉℃渶灏忎絾楂樹环鍊肩殑閾捐矾锛氱鐢ㄧ敤鎴锋椂鎾ら攢浠嶆湁鏁堢殑 refresh token锛涘彈淇濇姢璇锋眰涓嶅啀鍙俊浠?JWT claim锛岃€屾槸鎸夋暟鎹簱涓殑褰撳墠鐢ㄦ埛鐘舵€佸拰瑙掕壊鍋氭牎楠屻€?
### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/admin/service/user_actions_test.go`锛屾柊澧?RED/GREEN 鍥炲綊锛岄攣瀹氱鐢ㄧ敤鎴峰悗蹇呴』鎾ら攢鍏朵粛鏈夋晥鐨?`refresh_tokens`锛岄伩鍏嶅悗鍙版不鐞嗗彧鏀圭敤鎴风姸鎬併€佷笉褰卞搷鍚庣画 refresh銆?- 鏂板 `backend/internal/middleware/auth_test.go`锛屽厛鐢?RED 澶嶇幇涓や釜鐪熷疄缂哄彛锛氳绂佺敤鐢ㄦ埛浠嶅彲鎷挎棫 access token 璁块棶鍙椾繚鎶ゆ帴鍙ｏ紝浠ュ強鏁版嵁搴撹鑹插凡闄嶇骇鏃舵棫 JWT claim 浠嶅彲鑳戒繚鐣欑鐞嗗憳鏉冮檺銆?- 鏇存柊 `backend/internal/modules/admin/service/service.go`锛岃 `HandleUser(..., "disable")` 鍦ㄥ悓涓€浜嬪姟閲屽悓姝ユ挙閿€璇ョ敤鎴锋墍鏈夊皻鏈挙閿€鐨?refresh token锛岀‘淇濈鐢ㄥ姩浣滀細绔嬪埢褰卞搷鍚庣画 refresh銆?- 鏇存柊 `backend/internal/middleware/auth.go`锛岃璁よ瘉涓棿浠跺湪姣忔鍙椾繚鎶よ姹傞噷鎸?`claims.UserID` 鍥炴煡褰撳墠鐢ㄦ埛锛屽苟浠ユ暟鎹簱涓殑 `status / role / username` 涓哄噯鍐欏叆涓婁笅鏂囷紱琚鐢ㄨ处鍙蜂細鍦ㄤ腑闂翠欢灞傜洿鎺ヨ繑鍥?`user_disabled`锛岃鑹插彉鏇村悗鐨勬棫 token 涔熶笉鍐嶄繚鐣欐棫鏉冮檺銆?- 鏇存柊 `backend/internal/app/server.go` 涓?`backend/internal/modules/admin/router/router.go`锛屾妸鏂扮殑 `authGuard` 缁熶竴鎺ュ埌鏅€氬彈淇濇姢璺敱涓庡悗鍙版不鐞嗚矾鐢憋紝閬垮厤鍚庡彴鍜屽墠鍙板嚭鐜颁笉鍚屾鐨勬潈闄愯竟鐣屻€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`銆乣docs/engineering/CODEX_EXECUTION_ROADMAP.md` 涓?`docs/engineering/CODEX_PROJECT_CONTEXT.md`锛屾妸 `ADM-011` 鐨勭敤鎴锋不鐞嗙姸鎬佷粠鈥渓ogin/refresh 鎷掔粷鈥濇帹杩涘埌鈥滅鐢ㄥ嵆鎾ら攢 refresh + 璇锋眰鏃跺嵆鏃舵寜鐪熷疄鐢ㄦ埛鐘舵€?瑙掕壊鏍￠獙鈥濄€?
### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/admin/service -run 'TestHandleUserDisableRevokesActiveRefreshTokens|TestHandleUserDisablesActiveUserAndWritesAuditLog|TestHandleUserActivatesDisabledUser|TestHandleUserRejectsProtectedAdminAccount'`
- RED锛歚go test ./internal/middleware -run 'TestAuthenticateRejectsDisabledUser|TestAuthenticateUsesCurrentRoleFromDatabase'`
- GREEN锛歚go test ./internal/modules/admin/service -run 'TestHandleUserDisableRevokesActiveRefreshTokens|TestHandleUserDisablesActiveUserAndWritesAuditLog|TestHandleUserActivatesDisabledUser|TestHandleUserRejectsProtectedAdminAccount'`
- GREEN锛歚go test ./internal/middleware -run 'TestAuthenticateRejectsDisabledUser|TestAuthenticateUsesCurrentRoleFromDatabase'`
- `go test ./internal/modules/auth/service -run 'TestLoginRejectsDisabledUser|TestRefreshRejectsDisabledUser'`
- `go test ./...`

### 鍚庣画褰卞搷

- 鍚庡彴鐢ㄦ埛娌荤悊鐜板湪涓嶅啀鍙奖鍝嶁€滀笅娆＄櫥褰?/ 涓嬫 refresh鈥濓紱绂佺敤鐢ㄦ埛鍚庯紝鐜版湁 refresh token 浼氳鎾ら攢锛岃繍琛屼腑鐨勫彈淇濇姢璇锋眰涔熶細鍦ㄤ腑闂翠欢灞傛寜鐪熷疄鐢ㄦ埛鐘舵€佷笌瑙掕壊閲嶆柊鏍￠獙銆?- 褰撳墠鍓嶅悗鍙板叡浜細璇濆眰浠嶄富瑕佸洿缁?`401 refresh/replay/fail-logout`锛涘浜庤姹傞樁娈电洿鎺ユ敹鍒扮殑 `403 user_disabled`锛屽墠绔繕娌℃湁缁熶竴娓?session 骞舵彁绀衡€滆处鍙峰凡琚鐢ㄢ€濈殑琚姩鐧诲嚭璇箟锛屽悗缁洿閫傚悎娌?`API-011 / ADM-011` 鑱斿姩鏀跺彛銆?## 2026-07-09 13:24:15 +08:00 | v1.1.0-alpha.153 | 鎺ㄨ繘 SE-020 鎼滅储鐪熷疄鍛戒腑鏁颁笌棣栨壒杩斿洖鏁板垎绂?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘鎼滅储浜у搧鍖栵紝浣嗗厛鏀跺彛鏈€灏忓畨鍏ㄥ垏鐗囷紝涓嶇洿鎺ヤ竴鍙ｆ皵寮曞叆 cursor 鎴栭噸鍋氭悳绱㈤〉銆?- 鏈疆鐩爣鏄妸 `/api/v1/search` 鐨勨€滅湡瀹炲懡涓€绘暟鈥濅笌鈥滃綋鍓嶉鎵硅繑鍥炴壒娆♀€濇樉寮忔媶寮€锛岄伩鍏嶇敤鎴风鎶婂綋鍓嶆壒娆″垎椤佃鍒や负鏈嶅姟绔湡鍒嗛〉锛屼篃涓哄悗缁?`SE-020` 鐨?cursor/offset 濂戠害棰勭暀鎺ュ彛璇箟銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/search/dto/search.go`銆乣service/service.go`銆乣service/indexer.go` 涓庣浉鍏虫祴璇曪細鎼滅储 grouped payload 鐜板凡绋冲畾杩斿洖 `count`銆乣returnedCount` 涓?`results[]`锛屽叾涓?`count` 琛ㄧず鐪熷疄鍛戒腑鎬绘暟锛宍returnedCount` 琛ㄧず杩欐璇锋眰瀹為檯杩斿洖鐨勯鎵规暟閲忥紝`total` 涔熷悓姝ユ敼涓烘墍鏈夊垎缁勭湡瀹炲懡涓€绘暟涔嬪拰銆?- 鏂板 / 鏇存柊 `backend/internal/modules/search/service/indexer_test.go`銆乣service_test.go` 涓?`handler_test.go`锛屽厛鐢?RED 閿佸畾鈥滅湡瀹炲懡涓暟澶т簬杩斿洖鎵规鏁扳€濇椂鐨勮涓猴紝鍐嶅湪 GREEN 閿佸畾 `SE-020` 杩欎竴灏忔鐨勫悗绔绾︺€?- fallback indexer 涓嶅啀鎶?`url` 涓?`source` 閫氳繃 SQL `CONCAT(...)` 鎷艰繘鏌ヨ缁撴灉锛岃€屾槸鍦?Go 灞傜粺涓€鏋勯€狅紝鍑忓皯鏁版嵁搴撴柟瑷€鑰﹀悎锛屼篃璁?sqlite 娴嬭瘯鐜鍙互鐩存帴楠岃瘉鐪熷疄鍛戒腑缁熻銆?- 鏇存柊 `frontend-user/src/api/types.ts`銆乣src/api/searchShare.test.ts`銆乣src/modules/search/SearchWorkspacePage.tsx` 涓?`SearchWorkspacePage.test.tsx`锛岃鐢ㄦ埛绔悳绱㈤〉缁х画淇濈暀褰撳墠鎵规鍐呭垎椤碉紝浣嗗綋鐪熷疄鍛戒腑鏁板ぇ浜庨鎵硅繑鍥炴暟鏃讹紝浼氭槑纭樉绀衡€滃綋鍓嶄粎灞曠ず棣栨壒 X / Y 鏉＄粨鏋溿€傗€濄€?- 閲嶅啓 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`锛屽苟鍚屾鏇存柊 `README.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`docs/engineering/CODEX_EXECUTION_ROADMAP.md`锛屾妸杩欐鍒囩墖鏍囪涓?`SE-020` 宸插惎鍔ㄤ絾灏氭湭瀹屾垚鏈嶅姟绔湡鍒嗛〉銆?
### 楠岃瘉缁撴灉

- `go test ./internal/modules/search/...`
- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts src/modules/search/SearchWorkspacePage.test.tsx`

### 鍚庣画褰卞搷

- 鎼滅储濂戠害鐜板湪缁堜簬鎶娾€滅湡瀹炲懡涓€绘暟鈥濆拰鈥滃綋鍓嶉鎵硅繑鍥炴暟缁勨€濆垎寮€琛ㄨ揪锛屽墠绔笉鍐嶉渶瑕佹妸 `count === results.length` 浣滀负闅愬惈鍓嶆彁锛涜繖涓哄悗缁ˉ `cursor / nextCursor / sort / duration` 鐣欏嚭浜嗘槑纭墿灞曚綅銆?- 鏈疆浠嶆湭瀹屾垚璺ㄦ壒娆℃湇鍔＄鍒嗛〉銆佹悳绱㈣€楁椂鏆撮湶銆佺┖缁撴灉寤鸿鍜屽紓姝ョ储寮曡兘鍔涳紱涓嬩竴姝ユ洿閫傚悎缁х画娌?`SE-020 / WB-043 / WB-044` 鎺ㄨ繘锛岃€屼笉鏄湪鎼滅储椤电户缁爢鏇村灞€閮?UI 閫昏緫銆?## 2026-07-13 03:47:23 +08:00 | v1.1.0-alpha.164 | 鎺ㄨ繘 FE-040 绠＄悊绔?conflict 椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊娌荤悊鑳藉姏锛岃€屾槸琛ョ鐞嗙鐪熷疄 `conflict` 椤甸潰鐘舵€佸叆鍙ｃ€?- 鐩爣鏄绠＄悊绔不鐞嗗姩浣滃湪鍛戒腑鍚庣 `409` 鐘舵€佽縼绉诲啿绐佹椂锛屼笉鍐嶉€€鍖栨垚娉涘寲閿欒鎴?stale锛岃€屾槸鏄庣‘杩涘叆鍏变韩 `DataState` 鐨?`conflict` 璇箟锛屽苟淇濈暀鎿嶄綔鑰呭綋鍓嶆煡鐪嬬殑璁板綍涓婁笅鏂囥€?
### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-admin/src/views/modules/AdminGovernanceModule.test.ts` 涓?`frontend-admin/src/views/AdminWorkspaceView.test.ts` 琛?RED锛屽鐜扳€淎I 浠诲姟閲嶈瘯鍛戒腑 `409 invalid_ai_task_transition` 鍚庝粛鍙樉绀?stale锛屼笖鐜版湁娌荤悊琛ㄦ牸涓嶄細鎸?conflict 璇箟淇濈暀鈥濈殑缂哄彛銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屼负璧勬枡娌荤悊銆佷妇鎶ユ不鐞嗐€佺敤鎴锋不鐞嗐€丄I 浠诲姟娌荤悊涓庡浘璋辨ā鏉挎不鐞嗗姩浣滅粺涓€琛ヤ笂 `409 -> conflict` 鐘舵€佹槧灏勶紱鏂扮殑娌荤悊鍔ㄤ綔寮€濮嬪墠浼氭竻鎺夋棫鐨?conflict 鏍囪锛屽姩浣滃け璐ュ懡涓?`409` 鏃跺垯鎶婄姸鎬佸洖鍐欏埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛岃娌荤悊妯″潡鍦?`conflict` 鏃跺拰 `stale` 涓€鏍峰悓鏃舵覆鏌撳叡浜姸鎬佷笌鐜版湁琛ㄦ牸锛岀‘淇濇搷浣滆€呰繕鑳界湅鍒板啿绐佸彂鐢熷墠鐨勮褰曡鎯呬笌鍙拷婧笂涓嬫枃銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-040` 鐨勭鐞嗙鐘舵€佽鐩栬鏄庢帹杩涘埌 `loading / error / empty / stale / unauthorized / conflict` 鍏€侀棴鍚堬紝骞惰ˉ鐧昏杩欐鎵ц璁板綍銆?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- GREEN锛歚npm --workspace frontend-admin run test -- src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataState.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-040` 鍦ㄧ鐞嗙宸茬粡鎶婂叚绫诲叡浜〉闈㈢姸鎬侀兘鎺ュ埌浜嗙湡瀹炲叆鍙ｏ紝鍚庣画鍙互鏇翠笓娉ㄥ湴鎶婂悓鏍风殑鍗忚閾哄埌鐢ㄦ埛绔垪琛ㄩ〉銆佸伐浣滃尯鍜岃法绔叡浜〉闈紝鑰屼笉鏄户缁仠鐣欏湪绠＄悊绔敹鍙ｃ€?- 褰撳墠 `conflict` 涓昏瑕嗙洊娌荤悊鍔ㄤ綔绫?`409`锛涘悗缁鏋滃悗绔ˉ鏇村璇诲彇鍨嬫垨鎵归噺娌荤悊鍨嬪啿绐佸叆鍙ｏ紝寤鸿缁х画娌垮悓涓€鍗忚鎵╁睍锛岄伩鍏嶉噸鏂板洖閫€鎴愭硾鍖?`error` 鎴?`stale`銆?## 2026-07-13 04:03:30 +08:00 | v1.1.0-alpha.165 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔悳绱?璧勬枡搴撻〉闈㈢姸鎬佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆℃妸鍏变韩椤甸潰鐘舵€佷粠绠＄悊绔户缁帹杩涘埌鐢ㄦ埛绔湡瀹炲垪琛ㄩ〉銆?- 鐩爣鏄 `SearchWorkspacePage` 涓?`MaterialsPage` 涓嶅啀鍋滅暀鍦ㄨ嚜鎷?message / placeholder锛岃€屾槸鐪熸杩涘叆鍏变韩 `DataState` 鍗忚锛屽厛琛ラ綈鐢ㄦ埛绔渶甯歌鐨?`loading / error / empty / stale` 鍏ュ彛銆?
### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-user/src/modules/search/SearchWorkspacePage.test.tsx` 涓?`frontend-user/src/pages/MaterialsPage.test.tsx` 琛?RED锛屽鐜扳€滄悳绱㈤〉鍜岃祫鏂欏簱椤佃繕娌℃湁鍏变韩鐘舵€侀鏋讹紝璧勬枡搴撳埛鏂板け璐ユ椂涔熶笉浼氫繚鐣欐棫鍒楄〃骞舵爣璁?stale鈥濈殑缂哄彛銆?- 鏇存柊 `frontend-user/src/modules/search/SearchWorkspacePage.tsx`锛屾妸鏃犲叧閿瘝銆佽姹傝繘琛屼腑銆佹悳绱㈠け璐ャ€佺瓫閫夋棤鍛戒腑杩欏洓绉嶇湡瀹炶矾寰勭粺涓€鎺ュ埌鍏变韩 `DataState`锛涙悳绱㈤〉鍦ㄦ棤鏈夋晥缁撴灉鏃朵笉鍐嶇户缁覆鏌撴暣椤甸浂缁撴灉鍒嗙粍鍗＄墖銆?- 閲嶅啓 `frontend-user/src/pages/MaterialsPage.tsx` 鐨勫姞杞界姸鎬佺紪鎺掞紝鎷嗗紑鈥滈〉闈㈠悓姝ョ姸鎬佲€濆拰鈥滄搷浣滅粨鏋滄彁绀衡€濓細棣栨鍚屾璧?`loading`锛岄娆″け璐ヨ蛋 `error`锛岃祫鏂欏簱涓虹┖鎴栫瓫閫夋棤鍛戒腑璧?`empty`锛屾敹钘?/ 璇勫垎 / 鏇存柊 / 鏂板缓鍚庣殑浜屾鍚屾澶辫触鍒欎繚鐣欐棫鍒楄〃骞舵樉寮忚繘鍏?`stale`銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-040` 鐨勫綋鍓嶈惤鐐规墿灞曞埌鈥滅鐞嗙鍏€?+ 鐢ㄦ埛绔悳绱?璧勬枡搴撻鎵圭湡瀹炵姸鎬佸叆鍙ｂ€濓紝骞剁櫥璁拌繖涓€杞墽琛岃褰曘€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx`
- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-040` 涓嶅啀鍙湪绠＄悊绔棴鐜紝鐢ㄦ埛绔湡瀹炲垪琛ㄩ〉涔熷紑濮嬪叡鐢ㄥ悓涓€濂楅〉闈㈢姸鎬佽涔夛紱鍚庣画鍙互娌块槄璇汇€佺瑪璁般€佸涔犲拰鏇村璺ㄧ鍒楄〃缁х画鎵╃姸鎬佽惤鐐癸紝鑰屼笉鏄噸鏂板啓鏁ｈ惤鐨勭┖鎬?閿欐€佹枃妗堛€?- 褰撳墠杩欒疆浼樺厛琛ョ殑鏄?`loading / error / empty / stale`锛沗unauthorized / conflict` 鍦ㄧ敤鎴风杩樻病鏈夊ぇ闈㈢Н鐪熷疄鍏ュ彛锛屽悗缁洿閫傚悎缁撳悎鍙椾繚鎶ゅ伐浣滃尯鍜屽甫鍒锋柊/鍐茬獊鍐崇瓥鐨勯〉闈㈢户缁帹杩涖€?## 2026-07-13 04:47:20 +08:00 | v1.1.0-alpha.169 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔ぞ鍖洪〉椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆″厛鏀跺彛鐢ㄦ埛绔?`CommunityPage` 鐨勭湡瀹為〉闈㈢姸鎬佸叆鍙ｃ€?- 鐩爣鏄绀惧尯椤典笉鍐嶆妸棣栧睆澶辫触鎴栧埛鏂板け璐ラ潤榛樹吉瑁呮垚鈥滅ぞ鍖鸿繕娌℃湁鍏紑鍒嗕韩鈥濈殑绌烘€侊紝鑰屾槸鏄庣‘杩涘叆鍏变韩 `error / stale`锛屽苟鍦ㄥ埛鏂板け璐ユ椂淇濈暀鐜版湁鍔ㄦ€佸垪琛ㄣ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-user/src/pages/CommunityPage.test.tsx`锛屽厛浠?RED 閿佸畾涓変釜缂哄彛锛氱ぞ鍖洪〉棣栧睆娌℃湁鍏变韩 `loading`锛涢灞忚鍙栧け璐ラ潤榛橀€€鍖栨垚绌烘€侊紱宸叉湁鍔ㄦ€佸垪琛ㄦ椂鍒锋柊澶辫触涔熸病鏈夊叡浜?`stale` 涓斾笉浼氫繚鐣欐棫鍐呭銆?- 鏇存柊 `frontend-user/src/pages/CommunityPage.tsx`锛屾柊澧?`CommunityFeedState` 涓?`loadPosts({ preserveExisting })`锛屾妸绀惧尯鍔ㄦ€佸尯鎺ュ埌鍏变韩 `loading / error / empty / stale` 椤甸潰鐘舵€佸崗璁€?- 绀惧尯鍔ㄦ€佸尯鐜板湪琛ヤ簡鐪熷疄鐨勨€滃埛鏂扮ぞ鍖哄姩鎬?/ 閲嶆柊鍔犺浇鈥濆叆鍙ｏ紱褰撳凡鏈夊垪琛ㄣ€佸啀娆″埛鏂板け璐ユ椂锛屼細娓叉煋鈥滅ぞ鍖哄姩鎬侀渶瑕佸埛鏂扳€濈殑鍏变韩 `stale` 鐘舵€侊紝鍚屾椂缁х画淇濈暀鏃у姩鎬佸垪琛紝涓嶅啀鎶婄敤鎴锋墦鍥炶瀵兼€х殑绌烘€併€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/CommunityPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/CommunityPage.test.tsx src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡缁х画鎺ㄨ繘鍒扮ぞ鍖烘祻瑙堣繖鏉″叕鍏卞叆鍙ｏ紝鐢ㄦ埛绔墿浣欌€滃け璐ラ潤榛樺洖绌烘€佲€濈殑椤甸潰鍙堝皯浜嗕竴鍧椼€?- 璁剧疆椤典粛淇濈暀 profile 璇诲彇澶辫触鏃堕潤榛樻棤鍙嶉鐨勮矾寰勶紱鍚庣画鏇撮€傚悎缁х画娌?`SettingsPage` 琛ュ叡浜?`loading / error`锛岃繘涓€姝ユ敹鍙ｇ敤鎴风鍏ㄥ眬鐘舵€佽涔夈€?
## 2026-07-13 04:43:40 +08:00 | v1.1.0-alpha.168 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔?AI 宸ヤ綔鍙伴〉闈㈢姸鎬佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鍥炲埌鏇存繁鐨勫浘璋卞唴鏍革紝鑰屾槸鍏堟敹鍙ｇ敤鎴风 `AiPage` 鐨勭湡瀹為〉闈㈢姸鎬佸叆鍙ｃ€?- 鐩爣鏄 AI 宸ヤ綔鍙板湪棣栧睆鑷妇澶辫触鏃舵槑纭繘鍏ュ叡浜?`error`锛屽苟鍦ㄧ‘璁ゅ崱鐗囪崏绋?/ 鍥捐氨鍙樻洿鍚庡埛鏂板け璐ユ椂杩涘叆鍏变韩 `stale`锛屽悓鏃朵繚鐣欑幇鏈夎崏绋垮拰浠诲姟涓婁笅鏂囷紝閬垮厤鎶婄敤鎴风洿鎺ユ墦鍥炵┖鐧藉伐浣滃彴銆?
### 瀹為檯鍙樻洿

- 鍦?`frontend-user/src/pages/AiPage.test.tsx` 鍏堣ˉ RED锛屽鐜颁袱澶勭湡瀹炵己鍙ｏ細AI 宸ヤ綔鍙伴灞忓け璐ュ彧鏈夊眬閮?message锛屾病鏈夊叡浜?`error`锛涚‘璁ゅ崱鐗囪崏绋垮悗濡傛灉閲嶆柊鍚屾澶辫触锛屼篃娌℃湁鍏变韩 `stale` 鎻愮ず涓庘€滀繚鐣欐棫鑽夌涓婁笅鏂団€濈殑鏂█銆?- 鏇存柊 `frontend-user/src/pages/AiPage.tsx`锛屾柊澧?`AiWorkspaceState` 涓?`loadAiWorkspace({ preserveExisting })`锛屾妸 AI 宸ヤ綔鍙颁富鍏ュ彛鎺ュ埌鍏变韩 `loading / error / stale` 椤甸潰鐘舵€佸崗璁€?- 褰撳墠 AI 宸ヤ綔鍙板湪棣栧睆澶辫触鏃朵細鏄庣‘娓叉煋鈥淎I 宸ヤ綔鍙版殏鏃朵笉鍙敤鈥濈殑鍏变韩 `error` 鐘舵€侊紱褰撳凡鏈夎崏绋?/ 浠诲姟涓婁笅鏂囥€佺‘璁よ崏绋挎垚鍔熷悗鍒锋柊澶辫触鏃讹紝浼氭覆鏌撯€淎I 宸ヤ綔鍙伴渶瑕佸埛鏂扳€濈殑鍏变韩 `stale` 鐘舵€侊紝鍚屾椂缁х画淇濈暀鍘熸湁鑽夌銆佷换鍔″巻鍙插拰鐩爣鍗＄粍 / 鍥捐氨涓婁笅鏂囥€?- 鍗＄墖鑽夌涓庡浘璋卞彉鏇磋崏绋跨殑纭鎴愬姛鍚庨兘浼氫紭鍏堝皾璇曚互 `preserveExisting: true` 鍒锋柊宸ヤ綔鍙帮紱濡傛灉鍒锋柊澶辫触锛屼笉鍐嶆妸鐢ㄦ埛鎵撳洖绌虹櫧椤碉紝涔熶笉鍐嶅彧鐣欎笅瀛ょ珛鐨勬搷浣滅粨鏋?message銆?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡缁х画鎺ㄨ繘鍒?AI 杈呭姪鐞嗚В杩欐潯涓诲涔犱富璺緞锛岀敤鎴风鍏抽敭宸ヤ綔鍙扮殑鍏变韩椤甸潰鐘舵€佸崗璁洿瀹屾暣浜嗐€?- 绀惧尯椤靛拰璁剧疆椤典粛淇濈暀鏈湴绌烘€?/ 閿欒鎬佺洿鍑鸿矾寰勶紱鍚庣画鏇撮€傚悎缁х画娌胯繖浜涘墿浣欓〉闈㈣ˉ鍏变韩 `error / unauthorized`锛岃繘涓€姝ユ敹鍙ｇ敤鎴风鍏ㄥ眬鐘舵€佽涔夈€?
## 2026-07-13 04:35:30 +08:00 | v1.1.0-alpha.167 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔椤甸〉闈㈢姸鎬佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鍥炲埌鏇存繁鐨勫浘璋辨垨 AI 缁嗚妭锛岃€屾槸鍏堟敹鍙ｇ敤鎴风棣栭〉 `DashboardPage` 鐨勭湡瀹為〉闈㈢姸鎬佸叆鍙ｃ€?- 鐩爣鏄棣栭〉璧勬枡鍖恒€佺ぞ鍖哄尯鍜屼釜浜虹瑪璁板尯涓嶅啀鎶婂け璐ユ垨鏉冮檺杈圭晫闈欓粯浼鎴愮┖鎬侊紝灏ゅ叾鎶娾€滄湭鐧诲綍鏃朵釜浜虹瑪璁板尯鈥濇帴鎴愮湡瀹炵殑鍏变韩 `unauthorized`銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-user/src/pages/DashboardPage.test.tsx`锛屽厛浠?RED 閿佸畾涓変釜缂哄彛锛氳祫鏂欏尯棣栧睆娌℃湁鍏变韩 `loading`锛涜祫鏂欏姞杞藉け璐ヤ細闈欓粯閫€鍖栨垚绌烘€侊紱鏈櫥褰曟椂涓汉绗旇鍖轰粛鏄剧ず鈥滆繕娌℃湁涓汉绗旇鈥濓紝娌℃湁鐪熷疄 `unauthorized` 鍥炲綊淇濇姢銆?- 鏇存柊 `frontend-user/src/pages/DashboardPage.tsx`锛屾寜璧勬枡銆佺ぞ鍖恒€佺瑪璁颁笁鍧楁暟鎹簮鍒嗗埆琛ヤ簡 section-level `DataState`锛氳祫鏂欏尯鍜岀ぞ鍖哄尯鐜板湪鍏峰鍏变韩 `loading / error / empty`锛屼釜浜虹瑪璁板尯鐜板湪鍏峰鍏变韩 `unauthorized / loading / error / empty`銆?- 棣栭〉鐨勮祫鏂欏尯涓庣ぞ鍖哄尯澶辫触鏃剁幇鍦ㄩ兘浼氫繚鐣欑嫭绔嬬殑鈥滈噸鏂板姞杞解€濆叆鍙ｏ紝涓嶅啀鍚炴帀鐪熷疄閿欒鍘熷洜锛涗釜浜虹瑪璁板尯鍦ㄦ湭鐧诲綍鏃朵細鏄庣‘鎻愮ず鈥滅櫥褰曞悗鏌ョ湅涓汉绗旇鈥濓紝鑰屼笉鏄户缁妸鏉冮檺杈圭晫浼鎴愮┖鎬併€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/DashboardPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/DashboardPage.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡浠庣敤鎴风鎼滅储銆佽祫鏂欍€侀槄璇汇€佺瑪璁般€佸涔犵户缁帹杩涘埌浜嗛椤碉紝鐢ㄦ埛绔富宸ヤ綔鍙扮殑鍏变韩椤甸潰鐘舵€佸崗璁洿瀹屾暣浜嗭紝涔熻ˉ涓婁簡鏇撮€氱敤鐨勭敤鎴风 `unauthorized` 鐪熷疄鍏ュ彛銆?- 绀惧尯椤点€佽缃〉鍜?AI 宸ヤ綔鍙颁粛淇濈暀鏈湴绌烘€?閿欒鎬佺洿鍑鸿矾寰勶紱鍚庣画鏇撮€傚悎缁х画娌胯繖浜涘墿浣欓〉闈㈣ˉ鐪熷疄 `error / unauthorized / stale`锛岃繘涓€姝ユ敹鍙ｇ敤鎴风鍏ㄥ眬鐘舵€佽涔夈€?
## 2026-07-13 04:31:20 +08:00 | v1.1.0-alpha.166 | 鎺ㄨ繘 FE-040 鐢ㄦ埛绔槄璇诲伐浣滃尯椤甸潰鐘舵€佹帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-040`锛岃繖娆′笉鎵╂柊鍩燂紝鑰屾槸鎶婄敤鎴风闃呰宸ヤ綔鍖虹殑鐪熷疄澶辫触璺緞鎺ュ埌鍏变韩椤甸潰鐘舵€佸崗璁€?- 鐩爣鏄 `ReaderPage` 鍦ㄩ灞?`getReaderState(...)` 澶辫触鏃舵槑纭繘鍏ュ叡浜?`error`锛屽苟鍦ㄦ壒娉ㄤ繚瀛樺悗鐨勯槄璇讳笂涓嬫枃鍒锋柊澶辫触鏃惰繘鍏ュ叡浜?`stale`锛屽悓鏃朵繚鐣欏綋鍓?PDF 涓庨〉鐮佷笂涓嬫枃锛岄伩鍏嶇敤鎴峰垰鎿嶄綔瀹屾垚灏辫鎵撳洖绌虹櫧闃呰鍖恒€?
### 瀹為檯鍙樻洿

- 鍏堝湪 `frontend-user/src/pages/ReaderPage.test.tsx` 琛?RED锛屽鐜颁袱澶勭湡瀹炵己鍙ｏ細闃呰涓婁笅鏂囬灞忚嚜涓惧け璐ユ病鏈夊叡浜?`error` 鍥炲綊淇濇姢锛涙壒娉ㄤ繚瀛樻垚鍔熷悗濡傛灉閲嶆柊鍚屾澶辫触锛屼篃娌℃湁鍏变韩 `stale` 鎻愮ず涓庘€滀繚鐣欐棫鍐呭鈥濈殑鏂█銆?- 鏇存柊 `frontend-user/src/pages/ReaderPage.tsx`锛屾柊澧?`ReaderWorkspaceState` 涓?`refreshReaderState(material, { preserveExisting })`锛屾妸闃呰宸ヤ綔鍖轰富鑸炲彴鍜屽彸渚ф鏌ュ櫒涓€璧锋帴鍒板叡浜?`loading / error / stale` 椤甸潰鐘舵€佸崗璁€?- 褰撳墠闃呰椤靛湪棣栧睆澶辫触鏃朵細鏄庣‘娓叉煋鈥滈槄璇诲唴瀹规殏鏃朵笉鍙敤鈥濈殑鍏变韩 `error` 鐘舵€侊紱褰撳凡鏈夐槄璇讳笂涓嬫枃銆佹壒娉ㄥ垱寤烘垚鍔熷悗鍒锋柊澶辫触鏃讹紝浼氭覆鏌撯€滈槄璇讳笂涓嬫枃闇€瑕佸埛鏂扳€濈殑鍏变韩 `stale` 鐘舵€侊紝鍚屾椂缁х画淇濈暀褰撳墠 PDF銆侀〉鐮佷笌鎵规敞涓婁笅鏂囥€?- 鎵规敞鍒犻櫎浠嶄繚鎸佷弗鏍煎埛鏂拌矾寰勶紝涓嶆妸鈥滃垹闄ゅ凡鎻愪氦浣嗗埛鏂板け璐モ€濈殑鍦烘櫙璇覆鏌撴垚鍙户缁紪杈戠殑鏃ф壒娉紝閬垮厤闃呰涓婁笅鏂囪涔夋贩娣嗐€?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/pages/MaterialsPage.test.tsx src/modules/search/SearchWorkspacePage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`

### 鍚庣画褰卞搷

- `FE-040` 鐜板湪宸茬粡瑕嗙洊鐢ㄦ埛绔悳绱€佽祫鏂欏簱銆侀槄璇汇€佺瑪璁板拰澶嶄範浜旀潯涓诲涔犺矾寰勶紝涓诲伐浣滃尯鐨勫叡浜〉闈㈢姸鎬侀鏋舵洿瀹屾暣浜嗐€?- 闃呰宸ヤ綔鍖烘洿缁嗙矑搴︾殑灞€閮ㄥ埛鏂般€佽祫婧愬垏鎹互鍙婅法椤?`unauthorized / conflict` 鍏ュ彛浠嶆湭闂悎锛涘悗缁洿閫傚悎缁х画娌?`ReaderPage` 妫€鏌ュ櫒閾捐矾鎴栬法绔叡浜垪琛ㄧ户缁ˉ榻愩€?## 2026-07-13 06:41:10 +08:00 | v1.1.0-alpha.186 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?FeatureCard 澶嶅悎鍗＄墖鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂不鐞嗘ā鍧楄兘鍔涳紝鑰屾槸缁х画娓呯悊 dashboard 閲屼粛鐒跺唴鑱旂殑 priority/status 澶嶅悎杩愯惀鍗＄墖楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminFeatureCard` Vue 閫傞厤灞傦紝骞舵妸浼樺厛闃熷垪鍗′笌瀹℃牳姒傝鍗″垏鍒板悓涓€濂楀叡浜嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminFeatureCard.vue` 涓?`AdminFeatureCard.test.ts`锛屾敹鍙ｅ悗鍙板鍚堝崱鐗囩殑 `eyebrow / title / description / actions / body` 濂戠害銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.vue` 涓?`AdminDashboardModule.test.ts`锛岃浼樺厛闃熷垪鍗″拰瀹℃牳姒傝鍗￠兘閫氳繃鍏变韩 `AdminFeatureCard` 娓叉煋锛屽悓鏃朵繚鐣欐瑙堢粺璁″崱銆佸鏍稿叆鍙ｆ寜閽拰璁℃暟璇箟銆?- 杩欎竴杞篃椤烘墜鎶?dashboard 妯″潡鍜屽搴旀祴璇曚腑鐨勬枃妗堟敹鍙ｅ埌鍙 UTF-8锛屽噺灏戝悗缁户缁帹杩涘叡浜鏋舵椂琚棫缂栫爜鍣０骞叉壈銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙 dashboard 澶嶅悎杩愯惀鍗＄墖涔熷凡杩涘叆鍏变韩 FeatureCard 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminFeatureCard.test.ts src/views/modules/AdminDashboardModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙板鑸€侀〉澶淬€侀《閮ㄦ潯銆佹憳瑕佸崱鐗囥€佹爣棰樺尯鍜屾不鐞嗚鎯呭尯锛宒ashboard 鐨?priority/status 澶嶅悎杩愯惀鍗＄墖涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙?dashboard 澶嶅悎鍗＄墖鏈€灏忓绾︼紱瀵艰埅鍒嗙粍鏍囬鍜屽悗鍙板垪琛ㄩ噷鐨勫唴瀹规憳瑕佸崟鍏冭繕娌℃湁杩涘叆鍏变韩灞傦紝鍚庣画鏇撮€傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?
## 2026-07-13 06:37:40 +08:00 | v1.1.0-alpha.185 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞傚叡浜?NavItem 閫傞厤灞傛帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂不鐞嗘ā鍧楄兘鍔涳紝鑰屾槸缁х画娓呯悊鍚庡彴鍏ㄥ眬澹冲眰閲屼粛鍦ㄥ唴鑱旂殑渚ц竟瀵艰埅鎸夐挳楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminNavItem` Vue 閫傞厤灞傦紝骞舵妸鍚庡彴渚ц竟鏍忛噷鐨勫浘鏍囥€佹爣棰樸€乥adge 鍜岀偣鍑诲垏鎹㈣涓哄垏鍒板悓涓€濂楀叡浜嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminNavItem.vue` 涓?`AdminNavItem.test.ts`锛屾敹鍙ｅ悗鍙板鑸」鐨?`active / badge / icon / press` 濂戠害銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.vue` 涓?`AdminShellFrame.test.ts`锛岃渚ц竟瀵艰埅鎸夐挳閫氳繃鍏变韩 `AdminNavItem` 娓叉煋锛屽悓鏃朵繚鐣欑幇鏈夊垎缁勩€佹ā鍧楀垏鎹€佸埛鏂板拰閫€鍑鸿涓恒€?- 杩欎竴杞篃椤烘墜鎶?`AdminShellFrame` 涓庡搴旀祴璇曚腑鐨勬枃妗堟敹鍙ｅ埌鍙 UTF-8锛屽噺灏戝悗缁户缁帹杩涘叡浜鏋舵椂琚棫缂栫爜鍣０骞叉壈銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙渚ц竟瀵艰埅椤逛篃宸茶繘鍏ュ叡浜?NavItem 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminNavItem.test.ts src/components/admin/AdminShellFrame.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€侀《閮ㄦ潯銆佹憳瑕佸崱鐗囥€佹暟鎹崱鐗囨爣棰樺尯鍜屾不鐞嗚鎯呭尯锛岃繛渚ц竟瀵艰埅鎸夐挳楠ㄦ灦涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｅ鑸」鏈€灏忓绾︼紱瀵艰埅鍒嗙粍鏍囬鍜?dashboard priority/status 澶嶅悎鍗＄墖杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?
## 2026-07-13 06:34:20 +08:00 | v1.1.0-alpha.184 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?RecordInspector 璇︽儏鍖烘帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂不鐞嗗姩浣滐紝鑰屾槸缁х画娓呯悊娌荤悊妯″潡閲屽唴鑱旂殑璁板綍璇︽儏鍖洪鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminRecordInspector` Vue 閫傞厤灞傦紝骞舵妸娌荤悊璁板綍璇︽儏鍖虹殑鏍囬銆佸瓧娈靛睍绀恒€佺┖鎬佸拰鍔ㄤ綔鍖哄垏鍒板悓涓€濂楀叡浜嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminRecordInspector.vue` 涓?`AdminRecordInspector.test.ts`锛屾敹鍙ｅ悗鍙拌鎯呭尯鐨?`eyebrow / title / fields / empty / actions` 濂戠害銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 涓?`AdminGovernanceModule.test.ts`锛岃娌荤悊璇︽儏鍖洪€氳繃鍏变韩 `AdminRecordInspector` 娓叉煋锛屽悓鏃朵繚鐣欑幇鏈夋憳瑕佸崱鐗囥€佹悳绱€佺瓫閫夈€佽褰曢€夋嫨涓庢不鐞嗗姩浣滆涓恒€?- `frontend-admin/src/views/AdminWorkspaceView.test.ts` 缁х画閫氳繃宸ヤ綔鍖虹骇鍥炲綊瑕嗙洊鐪熷疄妯″潡鎺ョ嚎锛岀‘淇濊繖杞叡浜鎯呭尯鎶界娌℃湁褰卞搷鍚庡彴娌荤悊涓昏矾寰勩€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙娌荤悊璇︽儏鍖轰篃宸茶繘鍏ュ叡浜?RecordInspector 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminRecordInspector.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€侀《閮ㄦ潯銆佹憳瑕佸崱鐗囥€佹悳绱㈠伐鍏锋爮銆佺瓫閫変笅鎷夊拰鏁版嵁鍗＄墖鏍囬鍖猴紝娌荤悊璇︽儏鍖虹殑瀛楁灞曠ず涓庡姩浣滃尯楠ㄦ灦涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｆ不鐞嗚鎯呭尯鏈€灏忓绾︼紱sidebar 瀵艰埅椤瑰拰 dashboard priority/status 澶嶅悎鍗＄墖杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?
## 2026-07-13 06:29:10 +08:00 | v1.1.0-alpha.183 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?DataCardHeader 鏍囬鍖烘帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂不鐞嗗姩浣滐紝鑰屾槸缁х画娓呯悊瀹℃牳涓庢不鐞嗘ā鍧楅噷閲嶅鍑虹幇鐨勬暟鎹崱鐗囨爣棰樺尯楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminDataCardHeader` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳闃熷垪涓庢不鐞嗚褰曞垪琛ㄧ殑鏍囬銆佽鏄庢枃妗堝垏鍒板悓涓€濂楀叡浜嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminDataCardHeader.vue` 涓?`AdminDataCardHeader.test.ts`锛屾敹鍙ｅ悗鍙版暟鎹崱鐗囨爣棰樺尯鐨?`title / description / actions` 濂戠害銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminModerationModule.test.ts`锛岃瀹℃牳妯″潡閫氳繃鍏变韩 `AdminDataCardHeader` 娓叉煋鏍囬鍖猴紝鍚屾椂淇濈暀鐜版湁鎼滅储銆佺瓫閫夈€佸垪琛ㄥ拰鍔ㄤ綔琛屼负銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 涓?`AdminGovernanceModule.test.ts`锛岃娌荤悊璁板綍鍒楄〃涔熼€氳繃鍏变韩 `AdminDataCardHeader` 杈撳嚭鏍囬鍖恒€?- `frontend-admin/src/views/AdminWorkspaceView.test.ts` 缁х画閫氳繃宸ヤ綔鍖虹骇鍥炲綊瑕嗙洊鐪熷疄妯″潡鎺ョ嚎锛岀‘淇濊繖杞叡浜爣棰樺尯鎶界娌℃湁褰卞搷鍚庡彴涓昏矾寰勩€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鏁版嵁鍗＄墖鏍囬鍖轰篃宸茶繘鍏ュ叡浜?DataCardHeader 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminDataCardHeader.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€侀《閮ㄦ潯銆佹憳瑕佸崱鐗囥€佹悳绱㈠伐鍏锋爮鍜岀瓫閫変笅鎷夛紝瀹℃牳涓庢不鐞嗘ā鍧楃殑鏁版嵁鍗＄墖鏍囬鍖轰篃寮€濮嬭蛋缁熶竴鍏变韩鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｆ爣棰樺尯鏈€灏忓绾︼紱璁板綍璇︽儏 inspector銆乸riority/status 澶嶅悎鍗＄墖鍜屽鑸」杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?
## 2026-07-13 06:24:10 +08:00 | v1.1.0-alpha.182 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?MetricCard 鎽樿鍗＄墖鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍘诲姞鏂扮殑娌荤悊鑳藉姏锛岃€屾槸缁х画娓呯悊鍚庡彴 dashboard 鍜屾不鐞嗘憳瑕佸尯閲岄噸澶嶅嚭鐜扮殑缁熻鍗＄墖楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminMetricCard` Vue 閫傞厤灞傦紝骞舵妸姒傝缁熻鍖轰笌娌荤悊鎽樿鍖哄垏鍒板悓涓€濂楀叡浜憳瑕佸崱鐗囧绾︺€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminMetricCard.vue` 涓?`AdminMetricCard.test.ts`锛屾敹鍙ｅ悗鍙版憳瑕佸崱鐗囩殑 label銆乿alue 鍜?helper 璇箟銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.vue` 涓?`AdminDashboardModule.test.ts`锛屾妸 overview cards 鏀逛负閫氳繃鍏变韩 `AdminMetricCard` 娓叉煋銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 涓?`AdminGovernanceModule.test.ts`锛岃娌荤悊鎽樿鍖轰篃閫氳繃鍏变韩 `AdminMetricCard` 杈撳嚭锛屽悓鏃朵繚鐣欑幇鏈夋悳绱€佺瓫閫夈€佸垪琛ㄤ笌鎿嶄綔琛屼负銆?- 宸ヤ綔鍖虹骇鍥炲綊缁х画閫氳繃 `frontend-admin/src/views/AdminWorkspaceView.test.ts` 楠岃瘉锛岀‘淇濊繖杞叡浜崱鐗囨娊绂绘病鏈夊甫鍋忓悗鍙版ā鍧椾富璺緞銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鎽樿鍗＄墖涔熷凡杩涘叆鍏变韩 MetricCard 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminMetricCard.test.ts src/views/modules/AdminDashboardModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€侀《閮ㄦ潯銆佹悳绱㈠伐鍏锋爮鍜岀瓫閫変笅鎷夛紝姒傝缁熻鍖轰笌娌荤悊鎽樿鍖虹殑閲嶅鍗＄墖楠ㄦ灦涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｆ憳瑕佸崱鐗囨渶灏忓绾︼紱priority/status 杩欑被澶嶅悎杩愯惀鍗＄墖鍜屽悗鍙板鑸」杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?
## 2026-07-13 06:18:40 +08:00 | v1.1.0-alpha.181 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞傚叡浜?CommandBar 閫傞厤灞傛帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂柊鐨勬不鐞嗗姩浣滐紝鑰屾槸缁х画娓呯悊鍚庡彴鍏ㄥ眬澹冲眰閲屼粛鐒舵墜鍐欑殑椤堕儴鏉￠鏋躲€?- 鐩爣鏄ˉ涓€涓?`AdminCommandBar` Vue 閫傞厤灞傦紝骞舵妸 `AdminShellFrame` 鐨?breadcrumb銆佸悓姝ョ姸鎬佸拰鍒锋柊鍔ㄤ綔鍒囧埌鍚屼竴濂楀叡浜嚭鍙ｃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminCommandBar.vue` 涓?`AdminCommandBar.test.ts`锛屾敹鍙ｅ悗鍙伴《閮ㄦ潯鐨?breadcrumb銆佺姸鎬佷笌 actions 鎻掓Ы濂戠害銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.vue`锛屾妸澹冲眰椤堕儴鏉′粠鍐呰仈缁撴瀯鏇挎崲涓?`AdminCommandBar`锛屼繚鐣欑幇鏈夆€滆繍钀ヤ腑蹇?/ 褰撳墠妯″潡 / 鏁版嵁宸茶繛鎺ユ垨鍚屾涓?/ 鍒锋柊鏁版嵁鈥濊涔夈€?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.test.ts`锛岄攣瀹氬悗鍙板３灞傚凡缁忕湡瀹為€氳繃鍏变韩 `AdminCommandBar` 鎺ョ嚎锛岃€屼笉鏄彧鏂板涓€涓绔嬬粍浠躲€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙澹冲眰椤堕儴鏉′篃宸茶繘鍏ュ叡浜?CommandBar 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminCommandBar.test.ts src/components/admin/AdminShellFrame.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€佹悳绱㈠伐鍏锋爮鍜岀姸鎬佺瓫閫夛紝杩炲３灞傞《閮ㄦ潯涔熷紑濮嬭蛋缁熶竴鐨勫叡浜鏋跺嚭鍙ｃ€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｉ《閮ㄦ潯鏈€灏忓绾︼紱瀵艰埅椤广€乵etric card 鍜屾洿澶嶆潅鐨勫悗鍙板揩鎹峰姩浣滆繕娌℃湁杩涘叆鍏变韩灞傦紝鍚庣画鏇撮€傚悎缁х画娌?`FE-041 / ADM-010` 鎺ㄨ繘銆?
## 2026-07-13 06:12:30 +08:00 | v1.1.0-alpha.180 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?Select 鐘舵€佺瓫閫夋帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸鎶婂鏍镐笌娌荤悊妯″潡閲屽凡缁忛噸澶嶅嚭鐜扮殑鐘舵€佷笅鎷夌瓫閫夋敹鍥炲叡浜眰銆?- 鐩爣鏄ˉ涓€涓?`AdminSelect` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳闃熷垪銆佹不鐞嗚褰曞垪琛ㄥ拰 `AdminWorkspaceView` 鐨勬湰鍦版淳鐢熺瓫閫変竴璧锋帴鍒板悓涓€濂楀叡浜绾︺€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminSelect.vue` 涓?`AdminSelect.test.ts`锛屾敹鍙ｇ鐞嗙鍏变韩涓嬫媺鐨?`ds-select`銆乣aria-invalid` 鍜?`update:modelValue` 璇箟銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminSearchToolbar.vue`銆乣admin.css`锛岀粰鍚庡彴鍏变韩鎼滅储宸ュ叿鏍忚ˉ涓?`filters` 鎻掓Ы鍜岀瓫閫変綅鏍峰紡銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue`銆乣AdminGovernanceModule.vue` 鍙婂搴旀祴璇曪紝璁╁鏍镐笌娌荤悊妯″潡缁熶竴閫氳繃鍏变韩 `AdminSelect` 鏆撮湶鐘舵€佺瓫閫夈€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue` 涓?`AdminWorkspaceView.test.ts`锛屾柊澧炲鏍?娌荤悊鏈湴 `statusFilter`銆佹淳鐢熺姸鎬侀€夐」銆佸垏鎹㈣鍥炬椂鐨勭瓫閫夐噸缃紝浠ュ強涓ゆ潯宸ヤ綔鍖虹骇鐘舵€佺瓫閫夊洖褰掋€?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鍏变韩 `AdminSelect` 宸叉帴鍏ュ鏍?娌荤悊鐘舵€佺瓫閫夛紝骞舵湁宸ヤ綔鍖虹骇鍥炲綊淇濇姢鈥濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminSelect.test.ts src/components/admin/AdminSearchToolbar.test.ts src/components/admin/AdminPageHeader.test.ts src/components/admin/AdminShellFrame.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙仠鐣欏湪鍚庡彴鎼滅储妗嗗拰椤靛ご楠ㄦ灦锛屽鏍?娌荤悊妯″潡鐨勯珮棰戠姸鎬佺瓫閫変篃寮€濮嬭蛋缁熶竴鐨勫叡浜?`Select` 涓庡伐鍏锋爮鍑哄彛銆?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｅ墠绔湰鍦扮瓫閫夛紱鏇村鏉傜殑缁勫悎绛涢€夈€佸悗绔垎椤?绛涢€夊弬鏁板拰 URL 鐘舵€佸悓姝ヨ繕娌℃湁杩涘叆缁熶竴濂戠害锛屽悗缁洿閫傚悎娌?`ADM-010 / WB-041` 缁х画鎺ㄨ繘銆?## 2026-07-13 06:47:22 +08:00 | v1.1.0-alpha.187 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞傚叡浜?NavGroup 閫傞厤灞傛帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂柊鐨勬不鐞嗗姩浣滐紝鑰屾槸缁х画娓呯悊鍚庡彴澹冲眰閲屼粛鐒舵墜鍐欑殑瀵艰埅鍒嗙粍楠ㄦ灦銆?- 鐩爣鏄ˉ涓€涓?`AdminNavGroup` Vue 閫傞厤灞傦紝骞舵妸 `AdminShellFrame` 鐨勫垎缁勬爣棰樹笌瀹瑰櫒鍒囧埌缁熶竴鍏变韩鍑哄彛锛岃鍚庡彴瀵艰埅浠庘€滃崟涓寜閽叡浜€濊繘涓€姝ユ帹杩涘埌鈥滃垎缁勯鏋跺叡浜€濄€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminNavGroup.vue` 涓?`AdminNavGroup.test.ts`锛屾敹鍙ｅ悗鍙板鑸垎缁勭殑 `title + slot` 鏈€灏忓绾︼紝骞惰ˉ涓婂叡浜爣棰樹笌妲戒綅鍐呭鍥炲綊銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminShellFrame.vue` 涓?`AdminShellFrame.test.ts`锛屾妸鍚庡彴渚ц竟瀵艰埅鍒嗙粍鏀逛负閫氳繃鍏变韩 `AdminNavGroup` 娓叉煋锛屽悓鏃朵繚鐣欑幇鏈夊鑸」鍒囨崲銆佸埛鏂版暟鎹拰閫€鍑哄悗鍙拌涓恒€?- 澹冲眰娴嬭瘯鐜板湪浼氬悓鏃堕攣瀹?`AdminCommandBar`銆乣AdminPageHeader`銆乣AdminNavGroup` 涓?`AdminNavItem` 鐨勭湡瀹炴帴绾匡紝閬垮厤杩欑粍鍏变韩閫傞厤灞傚彧鍋滅暀鍦ㄧ粍浠剁洰褰曢噷鏈惤鍒颁富璺緞銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙澹冲眰瀵艰埅鍒嗙粍涔熷凡杩涘叆鍏变韩 NavGroup 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminNavGroup.test.ts src/components/admin/AdminNavItem.test.ts src/components/admin/AdminShellFrame.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙板鑸」銆侀〉澶淬€侀《閮ㄦ潯鍜屽鍚堝崱鐗囷紝杩炰晶杈瑰鑸垎缁勬爣棰樹笌瀹瑰櫒涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛锛屽悗鍙板３灞傞鏋惰繘涓€姝ユ敹鍙ｃ€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｅ鑸垎缁勬渶灏忓绾︼紱鏇村鏉傜殑鍒嗙粍鎶樺彔銆佹潈闄愰┍鍔ㄩ殣钘忎互鍙婂垪琛ㄥ唴瀹规憳瑕佸崟鍏冭繕娌℃湁杩涘叆鍏变韩灞傦紝鍚庣画鏇撮€傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?## 2026-07-13 06:57:06 +08:00 | v1.1.0-alpha.188 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?ActionBar 鍔ㄤ綔鍖烘帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂柊鐨勬不鐞嗗煙鑳藉姏锛岃€屾槸缁х画娓呯悊鍚庡彴妯″潡閲屼粛鐒堕噸澶嶆墜鍐欑殑鍔ㄤ綔鎸夐挳缁勭粨鏋勩€?- 鐩爣鏄ˉ涓€涓?`AdminActionBar` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳琛屾搷浣滀笌娌荤悊璇︽儏鍔ㄤ綔閮藉垏鍒扮粺涓€鍏变韩鍑哄彛锛岃鍚庡彴娌荤悊浠庘€滃崟涓寜閽叡浜€濈户缁帹杩涘埌鈥滃姩浣滃尯楠ㄦ灦鍏变韩鈥濄€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminActionBar.vue` 涓?`AdminActionBar.test.ts`锛屾敹鍙ｅ悗鍙板姩浣滃尯鐨?`actions / variant / tone / press` 鏈€灏忓绾︼紝骞朵繚鐣欐ā鍧楃骇 `data-*` 閽╁瓙锛岄伩鍏嶆祴璇曞拰椤甸潰琛屼负閫€鍥炲悇鑷淮鎶ゃ€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminModerationModule.test.ts`锛屾妸瀹℃牳琛屽唴鐨勯€氳繃 / 椹冲洖 / 闅愯棌鎿嶄綔鍒囧埌鍏变韩 `AdminActionBar`锛屽悓鏃朵繚鐣欑姸鎬佺瓫閫夈€佹悳绱㈠拰鍔ㄤ綔浜嬩欢鍥炰紶銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 涓?`AdminGovernanceModule.test.ts`锛屾妸娌荤悊璇︽儏鍖哄姩浣滃垏鍒板叡浜?`AdminActionBar`锛屽悓鏃朵繚鐣欒褰曢€夋嫨銆佽鎯呭睍绀哄拰鍔ㄤ綔瑙﹀彂琛屼负銆?- 杩欎竴姝ヤ篃椤烘墜鎶婂鏍镐笌娌荤悊妯″潡鍙婂搴旀祴璇曟敹鍙ｅ埌鍙 UTF-8锛屽噺灏戝悗缁户缁帹杩涘叡浜鏋舵椂琚棫缂栫爜鍣０鎷栨參銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙瀹℃牳琛屾搷浣滀笌娌荤悊璇︽儏鍔ㄤ綔涔熷凡杩涘叆鍏变韩 ActionBar 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminActionBar.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栧悗鍙伴〉澶淬€侀《閮ㄦ潯銆佸鑸拰鍗＄墖楠ㄦ灦锛屽鏍镐笌娌荤悊妯″潡鐨勫姩浣滄寜閽粍涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛锛屽悗鍙版不鐞嗕富璺緞杩涗竴姝ユ敹鍙ｃ€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｅ姩浣滃尯鏈€灏忓绾︼紱鎵归噺娌荤悊宸ュ叿鏉°€佹潈闄愰┍鍔ㄧ鐢ㄦ€佸拰鏇村鏉傜殑寮傛鍙嶉杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?## 2026-07-13 07:05:32 +08:00 | v1.1.0-alpha.189 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?Tag 鐘舵€佹爣绛炬帴绾?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂柊鐨勬不鐞嗚兘鍔涳紝鑰屾槸缁х画娓呯悊鍚庡彴妯″潡閲岄噸澶嶆墜鍐欑殑绫诲瀷/鐘舵€?badge 缁撴瀯銆?- 鐩爣鏄ˉ涓€涓?`AdminTag` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳鍒楄〃涓庢不鐞嗚褰曢噷鐨勭姸鎬佹爣绛惧垏鍒扮粺涓€鍏变韩鍑哄彛锛岃鍚庡彴鐘舵€佽涔変笉鍐嶅垎鏁ｅ湪鍚勬ā鍧楁ā鏉块噷鍚勮嚜缁存姢銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminTag.vue` 涓?`AdminTag.test.ts`锛屾敹鍙ｅ悗鍙版爣绛剧殑 `label / tone` 鏈€灏忓绾︼紝璁?`neutral/status` 涓ょ鏍囩璇箟閫氳繃鍚屼竴灞?Vue 閫傞厤缁勪欢鏆撮湶銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminModerationModule.test.ts`锛屾妸瀹℃牳琛ㄤ腑鐨勫唴瀹圭被鍨嬩笌鐘舵€佹爣绛惧垏鍒板叡浜?`AdminTag`锛屽悓鏃朵繚鐣欐悳绱€佺瓫閫夊拰鍔ㄤ綔鍖鸿涓恒€?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue` 涓?`AdminGovernanceModule.test.ts`锛屾妸娌荤悊琛ㄤ腑鐨勭姸鎬佸垪鍒囧埌鍏变韩 `AdminTag`锛屽悓鏃朵繚鐣欒褰曢€夋嫨銆佽鎯呭睍绀哄拰鍔ㄤ綔瑙﹀彂琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛屾妸宸ヤ綔鍖虹骇瀵艰埅鍒囨崲鏂█瀵归綈鍒板綋鍓嶅３灞傜湡瀹炰娇鐢ㄧ殑 `data-admin-nav-item-view` 閽╁瓙锛岄伩鍏嶅洖褰掓祴璇曠户缁緷璧栨棫瀵艰埅鏍囪銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙瀹℃牳绫诲瀷/鐘舵€佹爣绛句笌娌荤悊璁板綍鐘舵€佹爣绛句篃宸茶繘鍏ュ叡浜?AdminTag 閫傞厤灞傗€濄€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminTag.test.ts src/views/modules/AdminModerationModule.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栨寜閽€侀〉澶淬€佸鑸€佸崱鐗囧拰鍔ㄤ綔鍖猴紝瀹℃牳涓庢不鐞嗘ā鍧楃殑鐘舵€佹爣绛捐涔変篃寮€濮嬭蛋缁熶竴鍏变韩鍑哄彛锛屽悗鍙板垪琛ㄨ涔夎繘涓€姝ユ敹鍙ｃ€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｆ爣绛炬渶灏忓绾︼紱瑙掕壊銆佹潵婧愩€佹壒閲忕瓫閫?chip 鍜屾洿缁嗙矑搴︾殑鐘舵€佽壊闃惰繕娌℃湁杩涘叆鍏变韩灞傦紝鍚庣画鏇撮€傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?## 2026-07-13 07:10:40 +08:00 | v1.1.0-alpha.190 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?ContentCell 鍐呭鎽樿鍗曞厓鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏灞€楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╂柊鐨勬不鐞嗚兘鍔涳紝鑰屾槸缁х画娓呯悊鍚庡彴瀹℃牳鍒楄〃閲屼粛鐒跺唴鑱旀墜鍐欑殑鏍囬+鎽樿鍐呭鍗曞厓銆?- 鐩爣鏄ˉ涓€涓?`AdminContentCell` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳鍒楄〃閲岀殑鍐呭鎽樿鍖哄垏鍒扮粺涓€鍏变韩鍑哄彛锛岃鍚庡彴鍒楄〃鍗曞厓寮€濮嬩粠鎸夐挳銆佹爣绛俱€佸姩浣滃尯涔嬪缁х画寰€鍐呭楠ㄦ灦鏀跺彛銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminContentCell.vue` 涓?`AdminContentCell.test.ts`锛屾敹鍙ｅ悗鍙板垪琛ㄥ唴瀹规憳瑕佸崟鍏冪殑 `title / summary` 鏈€灏忓绾︺€?- 鏇存柊 `frontend-admin/src/views/modules/AdminModerationModule.vue` 涓?`AdminModerationModule.test.ts`锛屾妸瀹℃牳鍒楄〃閲岀殑鏍囬+鎽樿鍗曞厓鍒囧埌鍏变韩 `AdminContentCell`锛屽悓鏃朵繚鐣欐爣绛俱€佺瓫閫夈€佸姩浣滃尯鍜岀姸鎬佽涔夈€?- 杩欎竴姝ユ病鏈夌户缁墿澶ф不鐞嗘ā鍧楃粨鏋勶紝鑰屾槸鍏堟妸鍚庡彴鍒楄〃閲岄珮棰戝嚭鐜扮殑鍐呭鎽樿妯″紡浠庢ā鍧楁ā鏉夸腑鎷垮嚭鏉ワ紝浣滀负鍚庣画璧勬枡娌荤悊銆佷妇鎶ュ垪琛ㄧ瓑鍒楄〃鍖栧叆鍙ｇ殑鍏变韩璧风偣銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminContentCell.test.ts src/views/modules/AdminModerationModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪涓嶅啀鍙鐩栨寜閽€佹爣绛俱€侀〉澶淬€佸鑸拰鍔ㄤ綔鍖猴紝瀹℃牳鍒楄〃閲岀殑鍐呭鎽樿鍗曞厓涔熷紑濮嬭蛋缁熶竴鍏变韩鍑哄彛锛屽悗鍙板垪琛ㄩ鏋剁户缁線鍙鐢ㄦ柟鍚戞敹鍙ｃ€?- 杩欎竴杞粛鐒跺彧鍏堟敹鍙ｅ唴瀹规憳瑕佹渶灏忓绾︼紱鏇村鏉傜殑鍒楄〃琛屽竷灞€銆佹壒閲忔不鐞嗗伐鍏锋潯鍜屾不鐞嗚鎯呭唴鐨勫瘜鍐呭鎽樿杩樻病鏈夎繘鍏ュ叡浜眰锛屽悗缁洿閫傚悎缁х画娌?`FE-041 / ADM-010` 寰€鍓嶆帹銆?## 2026-07-13 07:57:47 +08:00 | v1.1.0-alpha.198 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜?ConfirmStack 纭寮瑰眰楠ㄦ灦鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊 `AdminWorkspaceView.vue` 閲岄噸澶嶅爢鍙犵殑浜旂粍娌荤悊纭寮瑰眰妯℃澘銆?- 鐩爣鏄ˉ涓€涓?`AdminConfirmStack` Vue 閫傞厤灞傦紝骞舵妸瀹℃牳銆佷妇鎶ャ€佺敤鎴枫€丄I 浠诲姟銆佸浘璋辨ā鏉胯繖浜旀潯鐪熷疄娌荤悊纭娴佸垏鍒扮粺涓€寮瑰眰鍑哄彛锛岃鍚庡彴楂橀闄╂搷浣滅殑纭灞備笉鍐嶅湪宸ヤ綔鍙版ā鏉块噷閲嶅缁存姢銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/AdminConfirmStack.vue` 涓?`AdminConfirmStack.test.ts`锛屾敹鍙ｅ悗鍙扮‘璁ゅ脊灞傜殑鍏变韩瀹夸富楠ㄦ灦锛屽苟缁熶竴鎵挎帴 keyed confirm/cancel 浜嬩欢鍥炰紶銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屾妸浜旂粍鍐呰仈 `AdminConfirmDialog` 妯℃澘鏇挎崲涓哄叡浜?`AdminConfirmStack`锛屽悓鏃朵繚鐣欑幇鏈夊鏍搞€佷妇鎶ャ€佺敤鎴枫€丄I 浠诲姟銆佸浘璋辨ā鏉跨‘璁ゆ祦鐨勬爣棰樸€佽鏄庛€佸嵄闄╂€佸拰鎻愪氦娴佺▼銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.test.ts`锛岃ˉ涓婂伐浣滃彴鍦ㄧ湡瀹炲鏍哥‘璁よ矾寰勯噷宸茬粡閫氳繃鍏变韩纭寮瑰眰楠ㄦ灦娓叉煋鐨勬柇瑷€銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/AdminConfirmStack.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画娌垮悗鍙版不鐞嗙‘璁ら鏋跺悜涓婃敹鍙ｏ紝浜旀潯鐪熷疄楂橀闄╂不鐞嗙‘璁ゆ祦寮€濮嬪叡浜粺涓€鐨勫脊灞傚嚭鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙‘璁ゅ脊灞傚涓婚鏋讹紱鏇磋繘涓€姝ョ殑纭鏂囨绛栫暐銆佹潈闄愰┍鍔ㄧ鐢ㄦ€佸拰鎵归噺娌荤悊纭妯″瀷杩樻病鏈夌粺涓€锛屽悗缁€傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 08:04:57 +08:00 | v1.1.0-alpha.199 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜湰鍦扮瓫閫?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊 `AdminWorkspaceView.vue` 閲屽鏍稿垪琛ㄥ拰娌荤悊鍒楄〃鍚勮嚜缁存姢鐨勬湰鍦扮姸鎬佺瓫閫夈€佸叧閿瘝绛涢€変笌鐘舵€侀€夐」鐢熸垚閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜函鍑芥暟 helper锛屽苟鎶婂鏍稿垪琛ㄤ笌娌荤悊鍒楄〃鐨勬湰鍦扮瓫閫夎鍒欏垏鍒扮粺涓€鍑哄彛锛岃鍚庡彴鍒楄〃椤电殑鏌ヨ涓庣姸鎬佺瓫閫変笉鍐嶅湪宸ヤ綔鍙伴噷骞宠缁存姢涓ゅ瀹炵幇銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminModuleFilters.ts` 涓?`adminModuleFilters.test.ts`锛屾敹鍙ｅ悗鍙版湰鍦扮瓫閫変笌鐘舵€侀€夐」鐢熸垚鐨勫叡浜函鍑芥暟锛屽苟閿佸畾鐘舵€佸幓閲嶃€佺瓫閫夊拰鍏抽敭璇嶅尮閰嶈涓恒€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屾妸瀹℃牳鍒楄〃涓庢不鐞嗗垪琛ㄧ殑鏈湴绛涢€夐€昏緫鍒囧埌鍏变韩 helper锛岀粺涓€鐘舵€佽繃婊ゃ€佸叧閿瘝杩囨护涓庣姸鎬佷笅鎷夐€夐」鏉ユ簮銆?- 淇濈暀鐜版湁妯″潡椤甸潰涓?URL / 浼氳瘽 / 娌荤悊鍔ㄤ綔琛屼负涓嶅彉锛屽彧鍑忓皯宸ヤ綔鍙板ぇ鏂囦欢閲岀殑閲嶅绛涢€夊疄鐜般€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminModuleFilters.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?UI 楠ㄦ灦寰€鍏变韩椤甸潰閫昏緫鏀跺彛锛屽悗鍙板鏍稿垪琛ㄤ笌娌荤悊鍒楄〃寮€濮嬪鐢ㄧ粺涓€鐨勬湰鍦扮瓫閫?helper銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙瓫閫?helper锛涘悗缁洿閫傚悎缁х画鎶婃不鐞嗗垪瀹氫箟銆佸瓧娈垫枃妗堟槧灏勫拰鍔ㄤ綔鍏冩暟鎹篃鎻愬埌缁熶竴閰嶇疆灞傦紝鑰屼笉鏄户缁暀鍦?`AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ゃ€?
## 2026-07-13 08:15:30 +08:00 | v1.1.0-alpha.200 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜不鐞嗚褰?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊娌荤悊璁板綍鍦?`AdminGovernanceModule.vue`銆乣AdminRecordRow.vue` 鍜?`AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ょ殑瀛楁鏍煎紡鍖栥€佸瓧娈垫爣绛俱€佽褰曟爣棰樺拰鍒楅『搴忛€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜不鐞嗚褰?helper锛屽苟鎶婃不鐞嗘ā鍧椼€佽褰曡鍜屽伐浣滃彴閲岀殑璁板綍璇箟鍒囧埌缁熶竴鍑哄彛锛岃鍚庡彴娌荤悊璁板綍鐨勫睍绀鸿鍒欎笉鍐嶅湪澶氫釜缁勪欢閲岄噸澶嶇淮鎶ゃ€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/components/admin/governanceRecord.ts` 涓?`governanceRecord.test.ts`锛屾敹鍙ｆ不鐞嗚褰曠殑鍗曞厓鏍兼牸寮忓寲銆佸瓧娈垫爣绛俱€佽褰曟爣棰樺拰鍒楅『搴忚鍒欍€?- 鏇存柊 `frontend-admin/src/views/modules/AdminGovernanceModule.vue`锛屾敼涓哄鐢ㄥ叡浜不鐞嗚褰?helper 娓叉煋璇︽儏瀛楁銆佹憳瑕佸崱銆佽〃澶存爣棰樺拰閫変腑璁板綍鏍囬銆?- 鏇存柊 `frontend-admin/src/components/admin/AdminRecordRow.vue` 涓?`frontend-admin/src/views/AdminWorkspaceView.vue`锛屾妸娌荤悊璁板綍琛屽睍绀恒€佸伐浣滃彴绛涢€夋枃鏈嫾鎺ュ拰鍒楅『搴忚绠楀垏鍒板悓涓€灞?helper锛屽噺灏戝伐浣滃彴涓庡垪琛ㄧ粍浠剁殑閲嶅璁板綍璇箟瀹炵幇銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/components/admin/governanceRecord.test.ts src/components/admin/AdminRecordRow.test.ts src/views/modules/AdminGovernanceModule.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?UI 楠ㄦ灦鍜岄〉闈?helper 寰€鍏变韩娌荤悊璁板綍璇箟鎺ㄨ繘锛屾不鐞嗘ā鍧椼€佽褰曡鍜屽伐浣滃彴寮€濮嬪鐢ㄧ粺涓€鐨勮褰曞睍绀哄绾︺€?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚褰?helper锛涘悗缁洿閫傚悎缁х画鎶?`governanceConfig`銆佹不鐞嗗姩浣滃厓鏁版嵁鍜岃祫鏂欒褰曞埌瀹℃牳椤圭殑鏄犲皠涔熸彁鍒扮粺涓€閰嶇疆灞傦紝鑰屼笉鏄户缁暀鍦?`AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ゃ€?
## 2026-07-13 08:22:01 +08:00 | v1.1.0-alpha.201 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜不鐞嗛厤缃?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鍒囧幓鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画娓呯悊 `AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ょ殑娌荤悊妯″潡閰嶇疆銆佽祫鏂欐不鐞嗚褰曞埌瀹℃牳椤圭殑鏄犲皠锛屼互鍙婃不鐞嗘ā鍧楁弿杩?绌烘€佹潵婧愩€?- 鐩爣鏄ˉ涓€灞傚叡浜不鐞嗛厤缃?helper锛屽苟鎶婂伐浣滃彴閲岀湡瀹炰娇鐢ㄧ殑娌荤悊妯″潡 endpoint銆佺┖鎬佹枃妗堛€佹弿杩版枃妗堝拰璧勬枡娌荤悊鏄犲皠鍒囧埌缁熶竴鍑哄彛锛岃宸ヤ綔鍙扮户缁洖鍒扳€滃崗璋冨櫒鈥濊鑹层€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminGovernanceConfig.ts` 涓?`adminGovernanceConfig.test.ts`锛屾敹鍙ｆ不鐞嗘ā鍧楅厤缃€佹不鐞嗗姩浣滃厓鏁版嵁鍒ゆ柇銆佹不鐞嗘ā鍧楃被鍨嬪畧鍗紝浠ュ強璧勬枡娌荤悊璁板綍鍒板鏍搁」鐨勬ˉ鎺ユ槧灏勩€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃娌荤悊妯″潡鍔犺浇銆佸伐浣滃彴鎻忚堪鏂囨銆佹不鐞嗘ā鍧楃┖鎬佹潵婧愬拰璧勬枡娌荤悊鍔ㄤ綔鏄犲皠鍒囧埌鍏变韩娌荤悊閰嶇疆 helper銆?- 杩欐淇濈暀浜嗙幇鏈夋不鐞嗗姩浣滄祦銆乁RL 鐘舵€佸拰浼氳瘽琛屼负涓嶅彉锛屽彧鎶婂伐浣滃彴涓凡缁忕ǔ瀹氱殑娌荤悊閰嶇疆璇箟缁х画鎻愬埌鍏变韩灞傘€?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceConfig.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜褰曡涔夋帹杩涘埌鍏变韩娌荤悊閰嶇疆璇箟锛屽伐浣滃彴寮€濮嬪鐢ㄧ粺涓€鐨勬ā鍧楅厤缃拰璧勬枡娌荤悊妗ユ帴瑙勫垯銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗘不鐞嗛厤缃?helper锛涘伐浣滃彴閲岄拡瀵瑰悇娌荤悊鍩熺殑鍔ㄤ綔瑙﹀彂鍒嗗彂鍜岄儴鍒嗗巻鍙插唴鑱旈厤缃粛鏈畬鍏ㄦ娊绂伙紝鍚庣画閫傚悎缁х画娌胯繖鏉¤矾寰勬帹杩涖€?
## 2026-07-13 08:28:40 +08:00 | v1.1.0-alpha.202 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜不鐞嗗姩浣滃垎鍙?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鑳藉姏锛岃€屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ょ殑娌荤悊鍔ㄤ綔鍒ゅ畾涓庣‘璁ゆ祦鍒嗗彂閫昏緫銆?- 鐩爣鏄ˉ榻愬叡浜不鐞嗗姩浣滃垎鍙?helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴鐨?view-to-action dispatch 缁撴灉锛屽噺灏戦〉闈㈠眰瀵?`community / materials / users / ai / graph` 浜旂粍娌荤悊鍔ㄤ綔鐨勯噸澶嶅垎鏀淮鎶ゃ€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/views/adminGovernanceConfig.ts` 涓?`adminGovernanceConfig.test.ts`锛屾柊澧?`GovernanceActionPayload`銆乣GovernanceActionDispatch` 鍜?`resolveGovernanceActionDispatch(...)`锛屾妸鍏变韩娌荤悊鍔ㄤ綔鍒嗗彂瑙勫垯娌夊埌缁熶竴 helper锛屽苟琛ヤ笂绀惧尯涓炬姤銆佽祫鏂欐不鐞嗗拰鏃犳晥璧勬枡璁板綍鐨勫洖褰掔敤渚嬨€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃娌荤悊鍔ㄤ綔鎸夐挳鍏冩暟鎹洿鎺ュ鐢?`getGovernanceActions(...)`锛屽苟鎶?`requestGovernanceAction(...)` 鏀逛负娑堣垂鍏变韩 dispatch 缁撴灉锛屽啀鎸?`report / moderation / user / aiTask / template / invalid / noop` 涓冪被鍑哄彛杩涘叆鏃㈡湁纭娴併€?- 椤烘墜娓呯悊 `AdminWorkspaceView.vue` 閲屽凡缁忎笉鍙揪鐨勭姸鎬佺瓫閫夊垎鏀拰鏈啀浣跨敤鐨勮祫鏂欐槧灏勫嚱鏁帮紝杩涗竴姝ユ妸宸ヤ綔鍙版敹鍥炲埌鈥滃崗璋冨櫒鈥濊亴璐ｃ€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceConfig.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗛厤缃帹杩涘埌鍏变韩娌荤悊鍔ㄤ綔鍒嗗彂锛屽伐浣滃彴閲屽洿缁曚簲涓不鐞嗗煙鐨勫姩浣滆Е鍙戝垎鏀紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛鍔ㄤ綔鍒嗗彂 helper锛涙洿杩涗竴姝ョ殑娌荤悊璇︽儏鏂囨銆佸姩浣滅‘璁ゅ厓鏁版嵁褰掍竴鍜?page/feature 绾ф媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 08:36:45 +08:00 | v1.1.0-alpha.203 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜不鐞嗙‘璁ゆ枃妗?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鑳藉姏锛岃€屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼簲缁勬不鐞嗙‘璁ゅ脊灞傜殑鏍囬銆佽鏄庡拰鎸夐挳鏂囨鍏冩暟鎹€?- 鐩爣鏄ˉ涓€灞傚叡浜不鐞嗙‘璁ゆ枃妗?helper锛屽苟璁╁伐浣滃彴鐨勭‘璁ゅ脊灞傜洿鎺ュ鐢ㄧ粺涓€ copy 鐢熸垚閫昏緫锛屽噺灏戦〉闈㈠眰瀵?moderation銆乺eport銆乽ser銆丄I task銆乼emplate 浜旀潯纭娴佺殑閲嶅鏂囨缁存姢銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminActionConfirmCopy.ts` 涓?`adminActionConfirmCopy.test.ts`锛屾敹鍙ｆ不鐞嗙‘璁ゆ枃妗堢殑绾嚱鏁?helper锛屽苟閿佸畾 moderation銆乺eport銆乽ser銆丄I task銆乼emplate 浜旂被纭 copy 鐨勬爣棰樸€佽鏄庛€佹寜閽枃妗堝拰鍗遍櫓鎬併€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `AdminConfirmStack` 鎵€娑堣垂鐨?dialog metadata 鐩存帴鏀逛负璇诲彇鍏变韩 `getModerationConfirmCopy(...)`銆乣getReportConfirmCopy(...)`銆乣getUserConfirmCopy(...)`銆乣getAITaskConfirmCopy(...)`銆乣getTemplateConfirmCopy(...)` 杈撳嚭銆?- 鏈疆涓嶆敼娌荤悊鍔ㄤ綔鎻愪氦娴佺▼銆丄PI 璺緞銆佺‘璁や氦浜掑崗璁拰 URL/session 琛屼负锛屽彧鎶婂凡绋冲畾鐨勭‘璁ゆ枃妗堣涔変粠宸ヤ綔鍙拌鍥句腑缁х画涓嬫矇鍒板叡浜?helper 灞傘€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminActionConfirmCopy.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗗姩浣滃垎鍙戞帹杩涘埌鍏变韩娌荤悊纭鏂囨锛屽悗鍙版不鐞嗙‘璁ゆ祦寮€濮嬪鐢ㄧ粺涓€鐨?copy 鐢熸垚鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛纭鏂囨 helper锛涙洿杩涗竴姝ョ殑娌荤悊璇︽儏瀛楁璇存槑銆佸姩浣滃彲瑙佹€у厓鏁版嵁鍜屾ā鍧楃骇 page/feature 鎷嗗垎浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 18:19:40 +08:00 | v1.1.0-alpha.204 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜鑸厓鏁版嵁 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽唴鑱旂殑瀵艰埅椤广€佸垎缁勯『搴忋€侀《閮ㄦ弿杩版枃妗堜笌璁℃暟瀛楁鍏冩暟鎹€?- 鐩爣鏄ˉ涓€灞傚叡浜鑸厓鏁版嵁 helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴鐨?nav item / group / description / count label 鐢熸垚閫昏緫锛屽噺灏戦〉闈㈠眰瀵规ā鍧楅鏋跺厓鏁版嵁鐨勯噸澶嶇淮鎶ゃ€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminViewMeta.ts` 涓?`adminViewMeta.test.ts`锛屾敹鍙ｅ悗鍙板鑸浘鏍囥€佸垎缁勩€佸窘鏍囥€侀《閮ㄦ弿杩板拰鏁伴噺鏂囨鐨勫叡浜?helper锛屽苟閿佸畾鍒嗙粍椤哄簭銆佸鏍稿窘鏍囧拰涓嶅悓瑙嗗浘鐨勬弿杩?璁℃暟杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `navItems`銆乣navGroups`銆乣activeDescription` 涓?`activeCountLabel` 鐩存帴娑堣垂鍏变韩 `buildAdminNavItems(...)`銆乣groupAdminNavItems(...)`銆乣getAdminViewDescription(...)` 涓?`getAdminActiveCountLabel(...)`銆?- 鏈疆涓嶆敼 URL 璺敱銆佹不鐞嗗姩浣溿€佷細璇濇祦鍜屾ā鍧楀唴瀹瑰睍绀猴紝鍙妸宸茬粡绋冲畾鐨勫伐浣滃彴椤堕儴鍏冩暟鎹户缁粠瑙嗗浘灞備笅娌夊埌鍏变韩 helper銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminViewMeta.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗙‘璁ゆ枃妗堟帹杩涘埌鍏变韩瀵艰埅鍏冩暟鎹紝宸ヤ綔鍙伴《閮ㄩ鏋跺紑濮嬪鐢ㄧ粺涓€鐨勫鑸€佸垎缁勫拰瑙嗗浘鎻忚堪鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛瀵艰埅鍏冩暟鎹?helper锛涙洿杩涗竴姝ョ殑娌荤悊璇︽儏瀛楁璇存槑銆佹ā鍧楃骇 feature 杈圭晫鍜岀‘璁?鍔ㄤ綔鐘舵€佹祦鎷嗗垎浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 18:27:10 +08:00 | v1.1.0-alpha.205 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜‘璁ょ姸鎬?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?keyed confirm dialog 鍒嗗彂鍜岄噸澶嶇‘璁ょ姸鎬侀噸缃€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜‘璁ょ姸鎬?helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴鐨?confirm key 绫诲瀷銆乲eyed handler 璺敱鍜屽叏閲?reset 鍏ュ彛锛屽噺灏戦〉闈㈠眰鍦?`handleConfirmDialogCancel / handleConfirmDialogConfirm / switchView / logout / session 娓呯┖` 涓婄殑閲嶅鍒嗘敮銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminConfirmDialogState.ts` 涓?`adminConfirmDialogState.test.ts`锛屾敹鍙ｅ悗鍙扮‘璁ゅ脊灞傜殑鍏变韩 `ConfirmDialogKey`銆乲eyed handler 璺敱鍜屽叏閲忕姸鎬?reset helper锛屽苟閿佸畾 key 椤哄簭涓?handler 鍒嗗彂琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 confirm dialog 鐨?cancel/confirm 鍒嗗彂鏀逛负娑堣垂鍏变韩 `runAdminConfirmDialogHandler(...)`锛屽悓鏃舵妸纭鐘舵€佹竻鐞嗗悎骞跺埌 `clearPendingConfirmState()` 骞跺鐢ㄥ埌 `switchView`銆乣logout` 鍜屽悗鍙颁細璇濆け鏁堟竻绌鸿矾寰勩€?- 鏈疆涓嶆敼娌荤悊鍔ㄤ綔 API銆佺‘璁ゆ枃妗堛€佹ā鍧楄矾鐢卞拰鍔犺浇琛屼负锛屽彧鎶婂凡绋冲畾鐨勭‘璁ょ姸鎬佸垎鍙戜笌 reset 璇箟缁х画浠庡伐浣滃彴瑙嗗浘灞備笅娌夊埌鍏变韩 helper銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminConfirmDialogState.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜鑸厓鏁版嵁鎺ㄨ繘鍒板叡浜‘璁ょ姸鎬侊紝宸ヤ綔鍙伴噷鐨?confirm key 鍒嗗彂鍜屾壒閲忔竻鐞嗗紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛纭鐘舵€?helper锛涙洿杩涗竴姝ョ殑娌荤悊璇︽儏瀛楁璇存槑銆佹ā鍧楃骇 feature 杈圭晫鍜岄〉闈㈢骇鏁版嵁鍗忚皟閫昏緫鎷嗗垎浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 18:35:05 +08:00 | v1.1.0-alpha.206 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜伐浣滃彴鐘舵€?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?query/filter銆佹暟鎹尯鍜岀‘璁ゅ尯鐨勯噸澶?reset 閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜伐浣滃彴鐘舵€?helper锛屽苟璁?`popstate`銆乣switchView`銆乣logout` 鍜屼細璇濆け鏁堟竻绌鸿矾寰勭洿鎺ュ鐢ㄧ粺涓€鐨?workspace reset key 璺敱锛屽噺灏戦〉闈㈠眰鍒嗘暎缁存姢鐨勬竻鐞嗗垎鏀€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceState.ts` 涓?`adminWorkspaceState.test.ts`锛屾敹鍙ｅ悗鍙板伐浣滃彴 `queries / filters / moderationData / governanceData / confirmState` 浜旂被 reset key 鐨勫叡浜?helper锛屽苟閿佸畾榛樿椤哄簭涓庢寜瀛愰泦娓呯悊鐨勮涓恒€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `handleAdminPopstate`銆乣switchView`銆乣logout` 鍜屽悗鍙颁細璇濆け鏁堟竻绌鸿矾寰勬敼涓烘秷璐瑰叡浜?`resetAdminWorkspaceState(...)`锛屽悓鏃舵妸 query/filter 娓呯悊涔熷苟鍏ョ粺涓€ workspace reset 鍏ュ彛銆?- 鏈疆涓嶆敼娌荤悊鍔ㄤ綔銆佹ā鍧楀姞杞姐€佷細璇濆崗璁拰 URL 璺敱锛屽彧鎶婂凡绋冲畾鐨勫伐浣滃彴灞€閮ㄧ姸鎬侀噸缃涔夌户缁粠椤甸潰灞備笅娌夊埌鍏变韩 helper銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceState.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜‘璁ょ姸鎬佹帹杩涘埌鍏变韩宸ヤ綔鍙扮姸鎬侊紝宸ヤ綔鍙伴噷鐨?query/filter/鏁版嵁鍖?reset 閫昏緫寮€濮嬪鐢ㄧ粺涓€鐨?workspace key 璺敱銆?- 杩欐浠嶇劧鍙厛鏀跺彛宸ヤ綔鍙扮姸鎬?helper锛涙洿杩涗竴姝ョ殑妯″潡绾?feature 杈圭晫鍜岄〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 19:12:10 +08:00 | v1.1.0-alpha.207 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜不鐞嗘彁浜ゅ厓鏁版嵁 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`report / user / aiTask / template` 鍥涚粍娌荤悊鎻愪氦鐨?endpoint銆佺己鍙傛姤閿欍€佹垚鍔?notice 鍜?fallback 閿欒鍏冩暟鎹€?- 鐩爣鏄ˉ涓€灞傚叡浜不鐞嗘彁浜ゅ厓鏁版嵁 helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴鐨?mutation meta 鐢熸垚閫昏緫锛屽噺灏戦〉闈㈠眰鍦ㄥ洓缁勬不鐞嗘彁浜ゅ嚱鏁颁笂鐨勯噸澶嶅瓧绗︿覆鍜?reload 璇箟缁存姢銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminGovernanceMutationMeta.ts` 涓?`adminGovernanceMutationMeta.test.ts`锛屾敹鍙?`report / user / aiTask / template` 鍥涚被娌荤悊鎻愪氦鐨勮矾寰勫墠缂€銆佺己鍙傛彁绀恒€佹垚鍔?notice 妯℃澘銆乫allback 閿欒鍜?reload view 鍏冩暟鎹紝骞堕攣瀹?`ready / invalid` 涓ょ被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛屾柊澧為€氱敤 `applyGovernanceRecordAction(...)`锛岃鍥涚粍娌荤悊鎻愪氦澶嶇敤缁熶竴鐨?mutation meta锛岃€屼笉鏄户缁悇鑷唴鑱旂淮鎶?`id / path / notice / error / reload` 璇箟銆?- 鏈疆涓嶆敼 moderation 瀹℃牳鎻愪氦閾捐矾锛屼笉鏀规不鐞嗗姩浣滅‘璁ゃ€乁RL 璺敱鎴栨ā鍧楀姞杞藉崗璁紝鍙妸宸茬ǔ瀹氱殑娌荤悊鎻愪氦鍏冩暟鎹户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceMutationMeta.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜伐浣滃彴鐘舵€佹帹杩涘埌鍏变韩娌荤悊鎻愪氦鍏冩暟鎹紝鍥涚粍娌荤悊鎻愪氦鍑芥暟寮€濮嬪鐢ㄧ粺涓€鐨?mutation meta 鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛娌荤悊鎻愪氦鍏冩暟鎹?helper锛涙洿杩涗竴姝ョ殑 moderation 瀹℃牳閾捐矾鏀跺彛鍜岄〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 19:19:40 +08:00 | v1.1.0-alpha.208 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜姞杞藉厓鏁版嵁 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`dashboard / moderation / governance` 涓夌被瑙嗗浘鐨勫姞杞藉垎鏀€乬overnance rows 淇濈暀鍒ゆ柇鍜?AI summary 鐗逛緥銆?- 鐩爣鏄ˉ涓€灞傚叡浜姞杞藉厓鏁版嵁 helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴鐨?load plan銆乻ummary endpoint 鍜?preserveRows 鍒ゆ柇閫昏緫锛屽噺灏戦〉闈㈠眰瀵硅鍥惧姞杞借鍒掔殑閲嶅鍒嗘敮缁存姢銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminViewLoadMeta.ts` 涓?`adminViewLoadMeta.test.ts`锛屾敹鍙ｅ悗鍙拌鍥惧姞杞借鍒掋€丄I summary endpoint 鍜?governance rows 淇濈暀鍒ゆ柇锛屽苟閿佸畾 `dashboard / moderation / governance` 涓夌被 load plan 杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `loadActiveView(...)` 涓?`loadGovernance(...)` 鏀逛负鐩存帴娑堣垂鍏变韩 `resolveAdminViewLoadPlan(...)` 鍜?`shouldPreserveGovernanceRows(...)`锛屼笉鍐嶅湪宸ヤ綔鍙伴噷閲嶅鍐呰仈杩欎簺鍒嗘敮銆?- 鏈疆涓嶆敼妯″潡璇锋眰璺緞銆佹不鐞嗗姩浣溿€佷細璇濆崗璁拰 URL 璺敱锛屽彧鎶婂凡绋冲畾鐨勫姞杞藉崗璋冨厓鏁版嵁缁х画浠庡伐浣滃彴瑙嗗浘灞備笅娌夊埌鍏变韩 helper銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminViewLoadMeta.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`
### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗘彁浜ゅ厓鏁版嵁鎺ㄨ繘鍒板叡浜姞杞藉厓鏁版嵁锛屽伐浣滃彴閲岀殑瑙嗗浘鍔犺浇璁″垝鍜?AI summary 鐗逛緥寮€濮嬪鐢ㄧ粺涓€鐨?load plan 鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛鍔犺浇鍏冩暟鎹?helper锛涙洿杩涗竴姝ョ殑妯″潡绾?feature 杈圭晫鍜岄〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:25:10 +08:00 | v1.1.0-alpha.209 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜〉闈㈢姸鎬?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽鏍搁槦鍒椾笌娌荤悊妯″潡鍚勮嚜缁存姢鐨?`loading / unauthorized / stale / conflict / error` 椤甸潰鐘舵€佸垽瀹氬垎鏀€?- 鐩爣鏄ˉ涓€灞傚叡浜〉闈㈢姸鎬?helper锛屽苟璁╁伐浣滃彴鐨勫鏍告€佷笌娌荤悊鎬侀兘鐩存帴澶嶇敤缁熶竴鐨勬暟鎹姸鎬佸垽瀹氬嚭鍙ｏ紝鍑忓皯椤甸潰灞傜户缁唴鑱旂淮鎶ょ姸鎬佹枃妗堝拰鍒嗘敮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminViewDataState.ts` 涓?`adminViewDataState.test.ts`锛屾敹鍙ｇ鐞嗙瀹℃牳/娌荤悊鏁版嵁鍖虹殑椤甸潰鐘舵€佸垽瀹氱函鍑芥暟锛屽苟閿佸畾 `loading / unauthorized / stale / conflict / error` 浜旂被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `moderationDataState` 涓?`governanceDataState` 鏀逛负鐩存帴娑堣垂鍏变韩 `resolveModerationDataState(...)`銆乣resolveGovernanceDataState(...)`锛屼笉鍐嶅湪宸ヤ綔鍙伴噷骞宠缁存姢涓ゅ鐘舵€佸垎鏀€?- 鏈疆涓嶆敼璇锋眰璺緞銆佹不鐞嗗姩浣溿€佷細璇濆崗璁拰 URL 璺敱锛屽彧鎶婂凡绋冲畾鐨勯〉闈㈢姸鎬佽涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminViewDataState.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜姞杞藉厓鏁版嵁鎺ㄨ繘鍒板叡浜〉闈㈢姸鎬佸垽瀹氾紝绠＄悊绔鏍稿拰娌荤悊鏁版嵁鍖哄紑濮嬪鐢ㄧ粺涓€鐨?`DataState` 鍒嗘敮鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛椤甸潰鐘舵€?helper锛涙洿杩涗竴姝ョ殑鍔犺浇澶辫触娓呯悊绛栫暐涓庨〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:30:20 +08:00 | v1.1.0-alpha.210 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜姞杞借姹?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽鏍搁槦鍒楀拰娌荤悊妯″潡鍚勮嚜缁存姢鐨勨€滆鍙栬姹傚け璐ョ姸鎬佺爜骞跺湪 403 鏃舵竻鐞嗘棫鏁版嵁鈥濆垎鏀€?- 鐩爣鏄ˉ涓€灞傚叡浜姞杞借姹?helper锛屽苟璁╁伐浣滃彴鐨勫鏍稿姞杞戒笌娌荤悊鍔犺浇閮藉鐢ㄧ粺涓€鐨勯敊璇姸鎬佹崟鑾峰拰 `forbidden` 娓呯悊鍑哄彛锛屽噺灏戦〉闈㈠眰閲嶅寮傚父鍒嗘敮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminViewLoadRequest.ts` 涓?`adminViewLoadRequest.test.ts`锛屾敹鍙ｇ鐞嗙鍔犺浇璇锋眰鐨勫叡浜墽琛?helper锛屽苟閿佸畾 `success / 403 forbidden / 闈?403 failure` 涓夌被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `loadModeration()` 涓?`loadGovernance()` 鏀逛负閫氳繃 `runAdminViewLoadRequest(...)` 澶勭悊璇锋眰澶辫触鐘舵€佷笌 403 娓呯悊锛岃€屼笉鏄户缁悇鑷唴鑱?`catch` 鍒嗘敮銆?- 鏈疆涓嶆敼瀹℃牳/娌荤悊璇锋眰璺緞銆佹垚鍔熸彁绀恒€乻ummary 鍔犺浇銆佷細璇濆崗璁拰 URL 璺敱锛屽彧鎶婂凡绋冲畾鐨勫姞杞藉け璐ュ鐞嗚涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminViewLoadRequest.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜〉闈㈢姸鎬佹帹杩涘埌鍏变韩鍔犺浇璇锋眰澶勭悊锛岀鐞嗙瀹℃牳涓庢不鐞嗗姞杞借矾寰勫紑濮嬪鐢ㄧ粺涓€鐨勯敊璇姸鎬佹崟鑾峰拰 forbidden 娓呯悊鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗗姞杞借姹?helper锛涙洿杩涗竴姝ョ殑 overview/profile 鍔犺浇鍗忚皟鍜岄〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:34:40 +08:00 | v1.1.0-alpha.211 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜瑙堝崱鐗?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?dashboard 姒傝鍗＄墖鐨勬寚鏍囪涔変笌 fallback 瑙勫垯銆?- 鐩爣鏄ˉ涓€灞傚叡浜瑙堝崱鐗?helper锛屽苟璁╁伐浣滃彴鐨?`overviewCards` 鐩存帴澶嶇敤缁熶竴鐨勫崱鐗囨瀯寤洪€昏緫锛屽噺灏戦〉闈㈠眰缁х画鍐呰仈缁存姢姒傝鎸囨爣鏂囨鍜屽€煎洖閫€瑙勫垯銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminOverviewCards.ts` 涓?`adminOverviewCards.test.ts`锛屾敹鍙?dashboard 姒傝鍗＄墖鐨勬爣绛俱€乭elper 鏂囨鍜屽€?fallback 瑙勫垯锛屽苟閿佸畾 overview 鏈夊€间笌 overview 缂哄け涓ょ被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `overviewCards` 鏀逛负鐩存帴娑堣垂鍏变韩 `buildAdminOverviewCards(...)`锛屼笉鍐嶅湪宸ヤ綔鍙伴噷鍐呰仈鍥涘紶姒傝鍗＄墖鐨勬瀯寤洪€昏緫銆?- 鏈疆涓嶆敼 dashboard 妯℃澘銆乷verview 璇锋眰璺緞銆佸鏍哥粺璁℃潵婧愭垨妯″潡璺敱锛屽彧鎶婂凡绋冲畾鐨勬瑙堝崱鐗囪涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminOverviewCards.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜姞杞借姹傛帹杩涘埌鍏变韩姒傝鎸囨爣璇箟锛宒ashboard 姒傝鍗＄墖寮€濮嬪鐢ㄧ粺涓€鐨?card builder 鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜?overviewCards helper锛涙洿杩涗竴姝ョ殑 dashboard feature 鍏冩暟鎹拰椤甸潰绾у崗璋冨櫒鎷嗗垎浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:38:50 +08:00 | v1.1.0-alpha.212 | 鎺ㄨ繘 FE-041 绠＄悊绔不鐞嗘ā鍧楅厤缃?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屾不鐞嗘ā鍧楁弿杩般€佺┖鎬佹枃妗堝拰妯″潡璇锋眰閰嶇疆鐨勯噸澶嶆潵婧愩€?- 鐩爣鏄ˉ涓€涓寜 route 璇诲彇娌荤悊妯″潡閰嶇疆鐨勫叡浜?helper锛屽苟璁╁伐浣滃彴鐩存帴澶嶇敤缁熶竴閰嶇疆鍑哄彛锛屾秷鎺夐〉闈㈤噷閭ｄ唤宸茬粡鍙戠敓杩?`graph` endpoint 婕傜Щ椋庨櫓鐨勬湰鍦伴噸澶嶉厤缃潡銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-admin/src/views/adminGovernanceConfig.ts` 涓?`adminGovernanceConfig.test.ts`锛屾柊澧?`getGovernanceModuleConfig(...)`锛岀粺涓€杩斿洖娌荤悊妯″潡鐨?endpoint銆乹uery銆乪mpty 鍜?description锛屽苟閿佸畾 governance route / non-governance route 涓ょ被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `activeDescription`銆乣loadGovernance(...)` 鍜屾不鐞嗘ā鍧楃┖鎬佹枃妗堥兘鏀逛负娑堣垂鍏变韩 `getGovernanceModuleConfig(...)`锛屽苟鍒犻櫎宸ヤ綔鍙伴噷閭ｄ唤鏈啀浣跨敤銆佷笖鏇惧 `graph` 瑙嗗浘鍐欐垚 `/api/v1/admin/tags` 鐨勬湰鍦?`governanceConfig` 閲嶅閰嶇疆銆?- 鏈疆涓嶆敼娌荤悊鍔ㄤ綔鍗忚銆佸垪琛ㄧ瓫閫夈€佷細璇濊涓哄拰璺敱缁撴瀯锛屽彧鎶婂凡绋冲畾鐨勬不鐞嗘ā鍧楅厤缃涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceConfig.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜瑙堟寚鏍囨帹杩涘埌鍏变韩娌荤悊妯″潡閰嶇疆锛屽伐浣滃彴閲岀殑娌荤悊鎻忚堪銆佺┖鎬佹枃妗堝拰鍔犺浇閰嶇疆寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗘不鐞嗘ā鍧楅厤缃?helper锛涙洿杩涗竴姝ョ殑 dashboard/overview 鍗忚皟鍜岄〉闈㈢骇鏁版嵁鍗忚皟鍣ㄦ媶鍒嗕粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:44:20 +08:00 | v1.1.0-alpha.213 | 鎺ㄨ繘 FE-041 绠＄悊绔叡浜鍙栬姹?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `refreshProfile()` 鍜?`loadOverview()` 杩欎袱鏉′粛鍚勮嚜缁存姢鐨勭畝鍗曡鍙栬姹傞摼璺€?- 鐩爣鏄ˉ涓€涓叡浜鍙?helper锛屽苟璁╁伐浣滃彴鐨勭鐞嗗憳璧勬枡璇诲彇涓庡悗鍙版瑙堣鍙栭兘澶嶇敤缁熶竴鐨勬垚鍔?澶辫触缁撴灉鍑哄彛锛屽噺灏戦〉闈㈠眰缁х画鎵嬪啓 `try/catch + fallback message`銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminViewReadRequest.ts` 涓?`adminViewReadRequest.test.ts`锛屾敹鍙ｇ畝鍗曡鍙栬姹傜殑鍏变韩鎵ц helper锛屽苟閿佸畾 `success`銆乣Error.message` 閫忎紶鍜屾湭鐭ラ敊璇?fallback message 涓夌被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `refreshProfile()` 鍜?`loadOverview()` 鏀逛负閫氳繃 `runAdminViewReadRequest(...)` 澶勭悊璇诲彇缁撴灉锛岃€屼笉鏄户缁悇鑷淮鎶ゅ唴鑱旂殑 `try/catch` 鍒嗘敮銆?- 鏈疆涓嶆敼鐧诲綍鍗忚銆佷細璇濆埛鏂般€乷verview 璇锋眰璺緞鎴?dashboard 妯℃澘锛屽彧鎶婂凡绋冲畾鐨勭畝鍗曡鍙栬涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminViewReadRequest.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜不鐞嗘ā鍧楅厤缃帹杩涘埌鍏变韩绠€鍗曡鍙栬姹傦紝宸ヤ綔鍙伴噷鐨?profile/overview 璇诲彇璺緞寮€濮嬪鐢ㄧ粺涓€鐨勬垚鍔?澶辫触缁撴灉鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚鍙栬姹?helper锛涙洿杩涗竴姝ョ殑 dashboard feature 鍏冩暟鎹拰椤甸潰绾?loading/error/notice 鍗忚皟浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:48:40 +08:00 | v1.1.0-alpha.214 | 鎺ㄨ繘 FE-041 绠＄悊绔华琛ㄧ洏鍏冩暟鎹?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 dashboard 妯″潡閲屼粛鍐呰仈缁存姢鐨勨€滀紭鍏堥槦鍒?/ 瀹℃牳姒傝 / 瀹℃牳鍘嬪姏鈥濆厓鏁版嵁鍜屾憳瑕佽鍒欍€?- 鐩爣鏄ˉ涓€涓叡浜?dashboard 鍏冩暟鎹?helper锛屽苟璁?`AdminDashboardModule.vue` 鐩存帴澶嶇敤缁熶竴鐨?feature copy 鍜屽鏍告瑙堟憳瑕佸嚭鍙ｏ紝鍑忓皯妯″潡灞傜户缁‖缂栫爜杩愯惀鏂囨鍜屽帇鍔涚姸鎬佽鍒欍€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminDashboardMeta.ts` 涓?`adminDashboardMeta.test.ts`锛屾敹鍙?dashboard 涓绘搷浣滃崱鐗囨枃妗堛€佸鏍告瑙堝崱鐗囨爣棰橈紝浠ュ強鈥滃緟瀹″笘瀛?/ 寰呭璧勬枡 / 瀹℃牳鍘嬪姏鈥濈殑鎽樿瑙勫垯锛屽苟閿佸畾鏈夊緟澶勭悊鍐呭涓庣┖闃熷垪涓ょ被杈撳嚭銆?- 鏇存柊 `frontend-admin/src/views/modules/AdminDashboardModule.vue`锛岃涓や釜 `AdminFeatureCard` 鐨?copy 鍜屽鏍告瑙堝垪琛ㄩ兘鏀逛负娑堣垂鍏变韩 `adminDashboardModerationFeature`銆乣adminDashboardSummaryFeature` 涓?`buildAdminDashboardSummaryItems(...)`锛屼笉鍐嶅湪妯″潡閲屽唴鑱旂淮鎶ょ浉鍚岃涔夈€?- 鏈疆涓嶆敼 dashboard 甯冨眬銆佷簨浠舵祦鎴?overview 鏁版嵁鏉ユ簮锛屽彧鎶婂凡绋冲畾鐨?dashboard 鍏冩暟鎹涔夌户缁粠妯″潡妯℃澘灞備笅娌夊埌鍏变韩 helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminDashboardMeta.test.ts src/views/modules/AdminDashboardModule.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜畝鍗曡鍙栬姹傛帹杩涘埌鍏变韩 dashboard 鍏冩暟鎹紝浠〃鐩樻ā鍧楀紑濮嬪鐢ㄧ粺涓€鐨?feature copy 鍜屽鏍告瑙堟憳瑕佸嚭鍙ｃ€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?dashboard 鍏冩暟鎹?helper锛涙洿杩涗竴姝ョ殑宸ヤ綔鍙扮骇 loading/error/notice 鍗忚皟浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:53:10 +08:00 | v1.1.0-alpha.215 | 鎺ㄨ繘 FE-041 绠＄悊绔姹傞敊璇?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽弽澶嶅嚭鐜扮殑鈥滀粠璇锋眰閿欒璇诲彇 status / message / fallback鈥濋€昏緫銆?- 鐩爣鏄ˉ涓€涓叡浜姹傞敊璇?helper锛屽苟璁╁伐浣滃彴鐨勭櫥褰曘€佸姞杞藉拰娌荤悊鍔ㄤ綔缁熶竴澶嶇敤鍚屼竴濂楅敊璇姸鎬佷笌鏂囨瑙ｆ瀽鍑哄彛锛屽噺灏戦〉闈㈠眰缁х画淇濈暀鏈湴 `getRequestErrorStatus(...)` 鍜屽澶?`error instanceof Error ? ...` 鍒嗘敮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminRequestError.ts` 涓?`adminRequestError.test.ts`锛屾敹鍙ｈ姹傞敊璇殑 `status` 璇诲彇鍜?`message / fallbackMessage` 瑙ｆ瀽锛屽苟閿佸畾鏁板瓧鐘舵€併€侀潪鏁板瓧鐘舵€佸拰 fallback message 琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岀Щ闄ゆ湰鍦?`getRequestErrorStatus(...)`锛岃鐧诲綍銆佸鏍稿姞杞姐€佹不鐞嗗姞杞姐€佸鏍稿姩浣滃拰娌荤悊鍔ㄤ綔閮芥敼涓烘秷璐瑰叡浜?`getAdminRequestErrorStatus(...)`銆乣getAdminRequestErrorMessage(...)`銆?- 鏈疆涓嶆敼璇锋眰鍗忚銆佺姸鎬佹祦銆佹不鐞嗗姩浣滆涔夋垨璺敱缁撴瀯锛屽彧鎶婂凡绋冲畾鐨勯敊璇В鏋愯涔夌户缁粠宸ヤ綔鍙拌鍥惧眰涓嬫矇鍒板叡浜?helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminRequestError.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?dashboard 鍏冩暟鎹帹杩涘埌鍏变韩璇锋眰閿欒瑙ｆ瀽锛屽伐浣滃彴閲岀殑 status/message fallback 閫昏緫寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗚姹傞敊璇?helper锛涙洿杩涗竴姝ョ殑宸ヤ綔鍙扮骇 loading/error/notice 鍗忚皟浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 20:57:20 +08:00 | v1.1.0-alpha.216 | 鎺ㄨ繘 FE-041 绠＄悊绔‘璁ゅ脊灞?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲岀‘璁ゅ脊灞傛暟缁勭殑閲嶅缁勮閫昏緫銆?- 鐩爣鏄ˉ涓€涓叡浜‘璁ゅ脊灞?helper锛屽苟璁╁伐浣滃彴閲岀殑 moderation / report / aiTask / template / user 浜旂粍纭寮瑰眰閮藉鐢ㄧ粺涓€鐨勯『搴忋€佸彇娑堟枃妗堛€佺‘璁や腑鐘舵€佸拰閿欒閫忎紶鍑哄彛锛屽噺灏戦〉闈㈠眰缁х画鍐呰仈澶ф dialog metadata 缁勮銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminConfirmDialogs.ts` 涓?`adminConfirmDialogs.test.ts`锛屾敹鍙ｇ‘璁ゅ脊灞傛暟缁勭殑鍏变韩缁勮 helper锛屽苟閿佸畾 canonical key 椤哄簭銆侀粯璁ゅ彇娑堟枃妗堛€佺‘璁や腑鐘舵€佸拰閿欒閫忎紶琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `confirmDialogs` 鏀逛负鐩存帴娑堣垂鍏变韩 `buildAdminConfirmDialogs(...)`锛屼笉鍐嶅湪宸ヤ綔鍙伴噷鍐呰仈缁存姢浜旂粍 dialog metadata 瀵硅薄銆?- 鏈疆涓嶆敼纭鏂囨銆佺‘璁ゅ姩浣滃崗璁€佸脊灞備氦浜掓垨鎸夐挳璇箟锛屽彧鎶婂凡绋冲畾鐨勫脊灞傜粍瑁呴€昏緫缁х画浠庡伐浣滃彴瑙嗗浘灞備笅娌夊埌鍏变韩 helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminConfirmDialogs.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜姹傞敊璇В鏋愭帹杩涘埌鍏变韩纭寮瑰眰缁勮锛屽伐浣滃彴閲岀殑浜旂粍纭寮瑰眰 metadata 寮€濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗙‘璁ゅ脊灞?helper锛涙洿杩涗竴姝ョ殑宸ヤ綔鍙扮骇 loading/error/notice 鍗忚皟浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?
## 2026-07-13 21:01:10 +08:00 | v1.1.0-alpha.217 | 鎺ㄨ繘 FE-041 绠＄悊绔伐浣滃彴鎻愮ず helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屽垎鏁ｇ淮鎶ょ殑宸ヤ綔鍙版彁绀烘枃妗堛€?- 鐩爣鏄ˉ涓€涓叡浜伐浣滃彴鎻愮ず helper锛屽苟璁╃櫥褰曟垚鍔熴€佷細璇濆け鏁堛€佸鏍?娌荤悊鍔犺浇鎴愬姛鍜岄€€鍑烘彁绀洪兘澶嶇敤缁熶竴鍑哄彛锛屽噺灏戦〉闈㈠眰缁х画鏁ｈ惤澶氬 notice 瀛楃涓层€?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceNotice.ts` 涓?`adminWorkspaceNotice.test.ts`锛屾敹鍙ｅ伐浣滃彴鐧诲綍鎴愬姛銆佷細璇濆け鏁?fallback銆佸鏍?娌荤悊鍔犺浇鎴愬姛鍜岄€€鍑烘彁绀烘枃妗堬紝骞堕攣瀹?prompt 浼樺厛涓庨粯璁?fallback 琛屼负銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃鐧诲綍銆佽嚜涓惧悗鐨?session 娓呯悊銆佸鏍稿姞杞姐€佹不鐞嗗姞杞藉拰閫€鍑鸿矾寰勯兘鏀逛负娑堣垂鍏变韩 `adminWorkspaceNotice` helper锛岃€屼笉鏄户缁唴鑱斿垎鏁ｅ瓧绗︿覆銆?- 鏈疆涓嶆敼璺敱銆佺姸鎬佹祦銆佹不鐞嗗姩浣滃崗璁垨椤甸潰甯冨眬锛屽彧鎶婂凡绋冲畾鐨勫伐浣滃彴鎻愮ず璇箟缁х画浠庡伐浣滃彴瑙嗗浘灞備笅娌夊埌鍏变韩 helper銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceNotice.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜‘璁ゅ脊灞傜粍瑁呮帹杩涘埌鍏变韩宸ヤ綔鍙版彁绀鸿涔夛紝鐧诲綍銆佷細璇濆け鏁堛€佸垪琛ㄥ姞杞藉拰閫€鍑烘彁绀哄紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛浜嗗伐浣滃彴鎻愮ず helper锛涙洿杩涗竴姝ョ殑宸ヤ綔鍙扮骇 loading/error/notice 鍗忚皟鐘舵€佹湰韬粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 00:27:30 +08:00 | v1.1.0-alpha.231 | 鎺ㄨ繘 FE-041 绠＄悊绔櫥褰曟墽琛?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`login()` 杩欐潯浠嶇洿鎺ョ淮鎶?`loading / error / session invalidation 娓呯悊 / 鎴愬姛鎻愮ず` 鐨勫３灞傛墽琛屽彛銆?- 鐩爣鏄ˉ涓€灞傚叡浜?login execution helper锛岃鍚庡彴宸ヤ綔鍙板湪绠＄悊鍛樼櫥褰曟椂涔熷鐢ㄧ粺涓€鎵ц鍑哄彛锛岃€屼笉鏄户缁妸杩欐绋冲畾缂栨帓鐣欏湪缁勪欢灞傘€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLogin.ts` 涓?`adminWorkspaceLogin.test.ts`锛屾敹鍙ｇ櫥褰曟椂鐨?loading 寮€鍏炽€侀敊璇竻鐞嗐€乻ession invalidation 娓呯悊銆乥ootstrap 璋冨害銆佹垚鍔熸彁绀轰笌澶辫触娑堟伅鍥炲～椤哄簭銆?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `login()` 鏀逛负娑堣垂鍏变韩 `runAdminWorkspaceLogin(...)` helper锛屽悓鏃剁户缁鐢ㄦ棦鏈?`runAdminWorkspaceLoginBootstrap(...)` 澶勭悊鐧诲綍鎴愬姛鍚庣殑 session 鎸佷箙鍖栥€乸rofile 鍒锋柊涓庡綋鍓?view 鍔犺浇銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鐧诲綍鎵ц涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLogin.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?`adminWorkspaceBootstrap` 鎺ㄨ繘鍒板叡浜?`adminWorkspaceLogin` 鎵ц澹冲眰锛岀鐞嗙鐧诲綍鏃剁殑涓存椂鐘舵€佹竻鐞嗕笌鎻愮ず鍚屾涔熷紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛鐧诲綍 execution helper锛涙洿杩涗竴姝ョ殑 `loadActiveView(...)` 娣卞眰鍔犺浇鍗忚皟涓庣‘璁ゅ脊灞傛彁浜ゅ叆鍙ｏ紝浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 00:36:20 +08:00 | v1.1.0-alpha.232 | 鎺ㄨ繘 FE-041 绠＄悊绔不鐞嗗姩浣滆姹?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲?`requestGovernanceAction(...)` 杩欐潯浠嶇洿鎺ョ淮鎶?dispatch 鍒嗗彂銆佺‘璁ら敊璇竻鐞嗐€乸ending action 鎵撳紑涓?invalid/noop 鍏滃簳鐨勫３灞傛墽琛屽彛銆?- 鐩爣鏄ˉ涓€灞傚叡浜?governance action request helper锛岃鍚庡彴宸ヤ綔鍙板湪娌荤悊鍔ㄤ綔鐐瑰嚮闃舵涔熷鐢ㄧ粺涓€鎵ц鍑哄彛锛岃€屼笉鏄户缁妸杩欐绋冲畾鍒嗗彂閾剧暀鍦ㄧ粍浠跺眰銆?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminGovernanceActionRequest.ts` 涓?`adminGovernanceActionRequest.test.ts`锛屾敹鍙?`report / moderation / user / aiTask / template / invalid / noop` 涓冪被 dispatch 鐨勭‘璁ら敊璇竻鐞嗐€乸ending action 鎵撳紑銆乵oderation 杞氦涓庨敊璇厹搴曢『搴忋€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `requestGovernanceAction(...)` 鏀逛负鍏堣В鏋?`resolveGovernanceActionDispatch(...)`锛屽啀娑堣垂鍏变韩 `runAdminGovernanceActionRequest(...)` helper锛岃€屼笉鏄户缁湪缁勪欢閲屾墜鍐欐暣娈?switch 鍒嗗彂銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙娌荤悊鍔ㄤ綔璇锋眰鍒嗗彂涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminGovernanceActionRequest.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜?`adminWorkspaceLogin` 鎺ㄨ繘鍒板叡浜?`adminGovernanceActionRequest`锛屽悗鍙版不鐞嗗姩浣滃湪杩涘叆纭寮瑰眰鍓嶇殑鍒嗗彂銆侀敊璇竻鐞嗕笌 invalid/noop 鍏滃簳涔熷紑濮嬪鐢ㄧ粺涓€鍑哄彛銆?- 杩欐浠嶇劧鍙厛鏀跺彛娌荤悊鍔ㄤ綔璇锋眰 execution helper锛涙洿杩涗竴姝ョ殑 `loadModeration()` / `loadGovernance()` 澹冲眰鍔犺浇缂栨帓鎴栫‘璁ゅ脊灞傛彁浜ゅ叆鍙ｏ紝浠嶉€傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 00:47:10 +08:00 | v1.1.0-alpha.233 | 鎺ㄨ繘 SE-020 鎼滅储缁熻淇℃伅閫忎紶涓庢悳绱㈤〉杈圭晫鎻愮ず
### 浠诲姟鍐呭

- 渚濇嵁鏇存柊鍚庣殑鐩爣锛屾妸鏈疆閲嶇偣浠庡崟鐐瑰３灞傛敹鍙ｅ垏鍥炴洿鍋忓熀纭€鍙敤鎬х殑涓荤珯鑳藉姏锛岄€夋嫨缁х画鎺ㄨ繘 `SE-020`锛屽厛琛ユ悳绱㈠搷搴旈噷鐨勭湡瀹炵粺璁′俊鎭€忎紶锛岃€屼笉鏄户缁繁鎸栧崟涓鐞嗙瑙嗗浘 helper銆?- 鐩爣鏄 `/api/v1/search` 鍦ㄧ幇鏈?grouped contract 涓嶅彉鐨勫墠鎻愪笅锛屽厛鏄惧紡閫忓嚭褰掍竴鍖栧悗鐨?`limit` 涓庣湡瀹?`elapsedMs`锛屽苟璁╂悳绱㈤〉鎶婂綋鍓嶉鎵硅竟鐣屽拰鑰楁椂灞曠ず鍑烘潵锛屼负鍚庣画璺ㄦ壒娆℃湇鍔＄鍒嗛〉鐣欐竻鏅板绾︺€?### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/search/dto/search.go` 涓?`backend/internal/modules/search/service/service.go`锛岃鎼滅储鍝嶅簲鏂板 `limit` / `elapsedMs`锛屽苟鍦?service 灞傜粺涓€閫忓嚭褰掍竴鍖栧悗鐨勬壒娆′笂闄愪笌鎼滅储鑰楁椂銆?- 鏇存柊 `frontend-user/src/api/types.ts` 涓?`frontend-user/src/modules/search/SearchWorkspacePage.tsx`锛岃鐢ㄦ埛绔悳绱㈤〉娑堣垂杩欎簺缁熻瀛楁锛屽湪鎴愬姛鎬佹枃妗堥噷鏄庣‘鏄剧ず鈥滄€荤粨鏋滄暟 + 鑰楁椂 + 褰撳墠姣忕粍棣栨壒涓婇檺鈥濄€?- 鏇存柊 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`銆乣README.md` 涓?`docs/engineering/CODEX_BACKLOG.md`锛屽悓姝ユ悳绱㈠搷搴斿瓧娈点€佺粺璁¤涔夊拰褰撳墠鎵规杈圭晫璇存槑銆?### 楠岃瘉缁撴灉

- `cd backend && go test ./internal/modules/search/service ./internal/modules/search/handler`
- `npm --workspace frontend-user run test -- src/modules/search/SearchWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `SE-020` 鐜板湪浠庘€滅湡瀹炲懡涓暟 / 棣栨壒杩斿洖鏁板垎绂烩€濈户缁帹杩涘埌鈥渓imit / elapsedMs` 閫忎紶涓庢悳绱㈤〉杈圭晫鎻愮ず鈥濓紝鎼滅储缁撴灉椤电殑缁熻淇℃伅鏇存帴杩戠湡瀹炴湇鍔＄濂戠害锛屼篃涓哄悗缁湇鍔＄ cursor / offset 鍒嗛〉鐣欏嚭浜嗘洿绋冲畾鐨勬枃妗堜笌鎺ュ彛浣嶇疆銆?- 杩欐浠嶇劧娌℃湁琛ヨ法鎵规鏈嶅姟绔垎椤碉紱涓嬩竴姝ユ洿閫傚悎缁х画娌?`SE-020` 澧炲姞 cursor/offset 鎴栫瓑浠峰垎椤典护鐗岋紝鑰屼笉鏄湪鍓嶇缁х画鍫嗗眬閮ㄥ垎椤?UI銆?## 2026-07-14 01:00:34 +08:00 | v1.1.0-alpha.234 | 鎺ㄨ繘 SE-020 鎼滅储 offset/nextOffset 璺ㄦ壒娆＄画鍙?### 浠诲姟鍐呭

- 缁х画娌跨潃 `CODEX_MASTER_PROMPT.md` 鎺ㄨ繘 `SE-020`锛屼絾淇濇寔鈥滃厛鎶婂熀纭€鑳藉姏鍋氶€氾紝鍐嶉€愭缁嗗寲鈥濈殑鑺傚锛岃繖涓€杞笉閲嶅仛鎼滅储椤碉紝鑰屾槸琛ユ渶灏忓彲鐢ㄧ殑璺ㄦ壒娆＄画鍙栧绾︺€?- 鐩爣鏄 `/api/v1/search` 鍦ㄧ幇鏈?grouped contract 涓嬪厛鏀寔 `offset` 璇锋眰涓庢寜缁?`nextOffset` 杩斿洖锛屽苟璁╃敤鎴风鍦ㄢ€滃崟涓€绫诲瀷绛涢€夆€濆満鏅笅鐪熺殑鑳界户缁姞杞戒笅涓€鎵圭粨鏋滐紝鑰屼笉鏄仠鐣欏湪鍙彁绀衡€滃綋鍓嶄粎灞曠ず棣栨壒缁撴灉鈥濄€?### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/search/dto/search.go`銆乣service/service.go`銆乣service/indexer.go` 涓?`handler.go`锛岃鎼滅储鎺ュ彛鏂板 `offset` 鏌ヨ鍙傛暟锛屽苟鍦ㄦ瘡缁?payload 閲岃繑鍥?`nextOffset`锛泂ervice 浼氱粺涓€褰掍竴鍖?`offset`锛宧andler 璐熻矗閫忎紶锛宖allback indexer 浼氬湪鎺掑簭鍚庢寜 offset 鍋氬垏鐗囥€?- 鏇存柊 `backend/internal/modules/search/service/service_test.go`銆乣indexer_test.go`銆乣handler_test.go`锛屽厛琛?RED 鍐嶈ˉ GREEN锛岄攣瀹?`offset` 閫忎紶銆乣nextOffset` 鐢熸垚鍜岀粍鍐呯画鍙栬涔変笉鍥為€€銆?- 鏇存柊 `frontend-user/src/api/search.ts`銆乣src/api/types.ts`銆乣src/api/searchShare.test.ts`銆乣src/modules/search/SearchWorkspacePage.tsx` 涓?`SearchWorkspacePage.test.tsx`锛岃鐢ㄦ埛绔悳绱?API 鏀寔 `offset`锛屾悳绱㈤〉鍦ㄥ崟涓€绫诲瀷绛涢€変笖瀛樺湪 `nextOffset` 鏃朵細鏄剧ず鈥滅户缁姞杞芥洿澶?..鈥濇寜閽紝骞舵妸涓嬩竴鎵圭粨鏋滆拷鍔犲埌褰撳墠缁勯噷銆?- 鏇存柊 `docs/engineering/SEARCH_CONTRACT_AND_REGRESSION.md`銆乣docs/engineering/CODEX_BACKLOG.md` 涓?`README.md`锛屾妸 `offset / nextOffset` 濂戠害銆佸崟涓€绫诲瀷缁彇杈圭晫鍜屼粛鏈畬鎴愮殑澶氬垎缁勭湡鍒嗛〉璇存槑鍐欏洖鏂囨。銆?### 楠岃瘉缁撴灉

- `cd backend && go test ./internal/modules/search/service ./internal/modules/search/handler`
- `npm --workspace frontend-user run test -- src/api/searchShare.test.ts src/modules/search/SearchWorkspacePage.test.tsx`
### 鍚庣画褰卞搷

- `SE-020` 鐜板湪宸茬粡浠庘€滅湡瀹炲懡涓暟 / 棣栨壒杩斿洖鏁板垎绂?+ 缁熻淇℃伅閫忎紶鈥濈户缁帹杩涘埌鈥滃崟涓€绫诲瀷鍙法鎵规缁彇鈥濈殑鏈€灏忓彲鐢ㄩ樁娈碉紝鎼滅储椤电粓浜庤兘鍩轰簬鍚庣濂戠害缁х画鎷夸笅涓€鎵规暟鎹紝鑰屼笉鏄彧鍋氭湰鍦板垎椤垫彁绀恒€?- 杩欎竴姝ヤ粛鐒舵病鏈夋妸鈥滃叏閮ㄧ被鍨嬧€濊鍥惧仛鎴愬畬鏁寸湡鍒嗛〉锛涘悗缁洿閫傚悎缁х画娌?`SE-020 / WB-043 / WB-044` 琛ュ鍒嗙粍鍒嗛〉缂栨帓銆佺粺涓€鎺掑簭鍏冩暟鎹拰鏇村己绱㈠紩瀹炵幇锛岃€屼笉鏄湪鍓嶇缁х画鍫嗗眬閮ㄦ妧宸с€?## 2026-07-14 02:29:10 +08:00 | v1.1.0-alpha.241 | 鎺ㄨ繘 FE-041 绠＄悊绔櫥褰曢潰鏉夸簨浠惰閰?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼紶缁?`AdminLoginPanel` 鐨勭櫥褰曢潰鏉夸簨浠剁粦瀹氶€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?`login-panel-events` helper锛岃鍚庡彴鏈櫥褰曞３灞備簨浠剁户缁鐢ㄧ粺涓€鍑哄彛锛岃€屼笉鏄妸杩欏眰妯℃澘绾ф彁浜ゃ€佽处鍙疯緭鍏ュ拰瀵嗙爜杈撳叆缁戝畾缁х画鐣欏湪椤甸潰缁勪欢閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLoginPanelEvents.ts` 涓?`adminWorkspaceLoginPanelEvents.test.ts`锛屾敹鍙ｇ櫥褰曢潰鏉?`submit`銆乣update:login-value` 涓?`update:password-value` 涓夋潯浜嬩欢鐨勮浆鍙戣閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `AdminLoginPanel` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceLoginPanelEvents` helper锛岄〉闈㈠眰鍙繚鐣?state銆乤ction 涓?helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鐧诲綍闈㈡澘浜嬩欢涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLoginPanelEvents.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜櫥褰曢潰鏉?props 瑁呴厤閾炬帹杩涘埌鍏变韩鐧诲綍闈㈡澘浜嬩欢瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙版湭鐧诲綍瑙嗗浘閲岀殑楂橀浜嬩欢缁戝畾杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?`login-panel-events` helper锛涙洿杩涗竴姝ョ殑鐧诲綍 feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 02:24:30 +08:00 | v1.1.0-alpha.240 | 鎺ㄨ繘 FE-041 绠＄悊绔櫥褰曢潰鏉?props 瑁呴厤 helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼紶缁?`AdminLoginPanel` 鐨勭櫥褰曢潰鏉?props 瑁呴厤閫昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?`login-panel-props` helper锛岃鍚庡彴鏈櫥褰曞３灞傝緭鍏ョ户缁鐢ㄧ粺涓€鍑哄彛锛岃€屼笉鏄妸杩欏眰妯℃澘绾ч敊璇€佹彁绀恒€佽緭鍏ュ€煎拰 loading 缁戝畾缁х画鐣欏湪椤甸潰缁勪欢閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceLoginPanelProps.ts` 涓?`adminWorkspaceLoginPanelProps.test.ts`锛屾敹鍙ｇ櫥褰曢潰鏉?`errorMessage`銆乣notice`銆乣loginPrompt`銆乣loginValue`銆乣passwordValue` 涓?`loading` 鐨勮閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `AdminLoginPanel` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceLoginPanelProps` helper锛岄〉闈㈠眰鍙繚鐣?state 涓?helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙鐧诲綍闈㈡澘 props 涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceLoginPanelProps.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜３灞備簨浠惰閰嶉摼鎺ㄨ繘鍒板叡浜櫥褰曢潰鏉?props 瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙版湭鐧诲綍瑙嗗浘閲岀殑楂橀杈撳叆缁戝畾杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?`login-panel-props` helper锛涙洿杩涗竴姝ョ殑鐧诲綍闈㈡澘浜嬩欢鎴栨洿瀹屾暣鐨勫３灞?feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 02:15:55 +08:00 | v1.1.0-alpha.239 | 鎺ㄨ繘 FE-041 绠＄悊绔３灞備簨浠惰閰?helper 鎺ョ嚎
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ュ叏鍏ㄥ眬楠ㄦ灦銆佸啀娣辨寲鍗曠偣鈥濇柟鍚戞帹杩?`FE-041`锛岃繖娆′笉鎵╁紶鏂扮殑鍚庡彴娌荤悊鍩熻兘鍔涳紝鑰屾槸缁х画鏀跺彛 `AdminWorkspaceView.vue` 閲屼紶缁?`AdminShellFrame` 鐨勫３灞備簨浠惰浆鍙戦€昏緫銆?- 鐩爣鏄ˉ涓€灞傚叡浜?`shell-events` helper锛岃鍚庡彴宸ヤ綔鍙板３灞備簨浠剁户缁鐢ㄧ粺涓€鍑哄彛锛岃€屼笉鏄妸杩欏眰妯℃澘绾?`logout / refresh / switch-view` 缁戝畾缁х画鐣欏湪澹冲眰缁勪欢閲屻€?### 瀹為檯鍙樻洿

- 鏂板 `frontend-admin/src/views/adminWorkspaceShellEvents.ts` 涓?`adminWorkspaceShellEvents.test.ts`锛屾敹鍙?`logout`銆乣refresh` 鍜?`switch-view` 涓夋潯澹冲眰浜嬩欢鐨勮浆鍙戣閰嶃€?- 鏇存柊 `frontend-admin/src/views/AdminWorkspaceView.vue`锛岃 `AdminShellFrame` 鏀逛负娑堣垂鍏变韩 `adminWorkspaceShellEvents` helper锛岄〉闈㈠眰鍙繚鐣?state銆乤ction 涓?helper 鍏ュ弬缁戝畾銆?- 鍚屾鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `FE-041` 褰撳墠杈圭晫鎺ㄨ繘鍒扳€滅鐞嗙澹冲眰浜嬩欢涔熷凡杩涘叆鍏变韩 helper 鍑哄彛鈥濄€?### 楠岃瘉缁撴灉

- `npm --workspace frontend-admin run test -- src/views/adminWorkspaceShellEvents.test.ts src/views/AdminWorkspaceView.test.ts`
- `npm --workspace frontend-admin run typecheck`
- `npm run build:admin`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `FE-041` 鐜板湪缁х画浠庡叡浜３灞?props 瑁呴厤閾炬帹杩涘埌鍏变韩澹冲眰浜嬩欢瑁呴厤閾撅紝鍚庡彴宸ヤ綔鍙版ā鏉垮眰閲岀殑楂橀浜嬩欢缁戝畾杩涗竴姝ュ彉钖勩€?- 杩欐浠嶇劧鍙厛鏀跺彛浜?`shell-events` helper锛涙洿杩涗竴姝ョ殑鐧诲綍闈㈡澘 props 鎴栨洿瀹屾暣鐨勫３灞?feature adapter锛屼粛閫傚悎缁х画娌?`ADM-010 / ADM-011` 寰€鍓嶆帹杩涖€?## 2026-07-14 02:50:57 +08:00 | v1.1.0-alpha.242 | 鎺ㄨ繘 LC-010 / ANKI-030 澶嶄範鏉ユ簮鍗＄墖娣遍摼瀹氫綅
### 浠诲姟鍐呭

- 缁х画鎸夌収 `CODEX_MASTER_PROMPT.md` 鐨勨€滃厛琛ラ綈涓昏矾寰勫彲鐢ㄦ€э紝鍐嶇户缁繁鎸栧眬閮ㄩ噸鏋勨€濇柟鍚戞帹杩涚敤鎴风涓诲涔犻棴鐜紝杩欎竴杞笉缁х画鍋滅暀鍦ㄥ悗鍙板伐浣滃彴鎶藉３锛岃€屾槸鍥炲埌鏇磋创杩戠湡瀹炲涔犺矾寰勭殑 `LC-010 / ANKI-030`銆?- 鐩爣鏄ˉ榻愬浘璋辨潵婧愬崱鐗囧洖璺冲埌澶嶄範宸ヤ綔鍖哄悗鐨勬渶鍚庝竴娈垫柇閾撅細褰撳浘璋辨潵婧愬弽閾剧敓鎴?`/review?card=<id>` 鏃讹紝澶嶄範宸ヤ綔鍖洪渶瑕佺湡姝ｈ瘑鍒 query锛屼紭鍏堝畾浣嶅搴斿崱鐗囷紝骞舵妸鐢ㄦ埛甯﹀埌鍙户缁涔犳垨鍏堝洖鐪嬪崱鐗囧唴瀹圭殑绋冲畾鍏ュ彛銆?
### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屾柊澧炲 `location.search` 涓?`card` 鍙傛暟鐨勬秷璐归€昏緫锛屽苟琛ュ厖 `prioritizeRequestedQueueItem(...)`锛岃澶嶄範宸ヤ綔鍖哄湪鐩爣鍗＄墖宸蹭綅浜庝粖鏃ラ槦鍒椾腑鏃朵紭鍏堟妸璇ュ崱鐗囬《鍒板綋鍓嶅涔犱綅銆?- 褰撶洰鏍囧崱鐗囦笉鍦ㄤ粖鏃ラ槦鍒椼€佷絾浠嶅瓨鍦ㄤ簬鏌愪釜鐗岀粍涓椂锛屽涔犲伐浣滃尯鐜板湪浼氳嚜鍔ㄥ畾浣嶆墍灞炵墝缁勩€佹墦寮€绠＄悊渚ф爮骞跺垏鍒扳€滃崱鐗団€濋〉绛撅紝鍚屾椂缁欏嚭鈥滃彲鍏堝洖鐪嬪崱鐗囧唴瀹癸紝鍐嶇户缁涔犫€濈殑鍙嶉鏂囨锛涜嫢鏈壘鍒板崱鐗囷紝鍒欐槑纭洖閫€鍒颁粖鏃ュ涔犻槦鍒楀苟鎻愮ず鏈懡涓€?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛岃ˉ涓?`/review?card=card-2` 鍦烘櫙鍥炲綊娴嬭瘯锛岄獙璇佹潵婧愬崱鐗囦細浼樺厛鎴愪负褰撳墠澶嶄範鍗＄墖锛屼笖绠＄悊渚ф爮淇濇寔鎵撳紑锛岄伩鍏嶅浘璋辨潵婧愬洖璺冲啀娆￠€€鍖栦负鍙細钀藉埌闃熷垪棣栧崱銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030` 涓?`LC-010` 鐘舵€佽皟鏁翠负 `IN_PROGRESS`锛屽苟鍚屾璁板綍鈥滃涔犳潵婧愬崱鐗囨繁閾惧畾浣嶁€濆凡鎵撻€氳繖涓€闃舵鎴愭灉銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `ANKI-030` 鐜板湪涓嶅啀鍙湁鈥滄潵婧愭煡鐪嬧€濈殑闈欐€佽瘔姹傦紝鍥捐氨鏉ユ簮鍙嶉摼宸茬粡鑳芥妸鐢ㄦ埛绋冲畾甯﹀洖澶嶄範宸ヤ綔鍖洪噷鐨勭洰鏍囧崱鐗囨垨鐩爣鐗岀粍锛屼富瀛︿範闂幆閲岀殑鈥滃浘璋?-> 澶嶄範鈥濋摼璺畬鏁翠簡涓€娈点€?- 杩欎竴姝ヨ繕娌℃湁琛ラ綈鈥滃涔?-> 鏉ユ簮姝ｆ枃/绗旇/鍥捐氨鑺傜偣鈥濈殑鍙嶅悜鍥炶烦锛屼篃杩樻病鏈夊疄鐜版挙閿€涓婁竴娆¤瘎鍒嗐€佽烦杩?鍩嬭棌銆佹殏鍋滃崱鐗囩瓑 Anki 浼氳瘽鑳藉姏锛涗笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-030 / WB-033 / LC-010` 鎶婃潵婧愬洖鐪嬩笌鍙嶉鍥炲啓琛ュ叏锛岃€屼笉鏄洖鍒伴浂鏁ｉ〉闈㈠井璋冦€?## 2026-07-14 03:00:47 +08:00 | v1.1.0-alpha.243 | 鎺ㄨ繘 LC-010 / ANKI-030 澶嶄範鏉ユ簮宸ヤ綔鍙板洖璺冲叆鍙?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`LC-010 / ANKI-030`锛岃繖涓€杞笉鍥炲埌鍚庡彴鎶藉３锛岃€屾槸缁х画鎶婂涔犲伐浣滃尯閲岀殑鐪熷疄鏉ユ簮鍥炵湅鍏ュ彛琛ラ綈銆?- 鐩爣鏄鐢ㄦ埛鍦ㄥ涔犲綋鍓嶅崱鐗囨椂锛屼笉鍙煡閬撹繖寮犲崱鈥滄潵鑷摢閲屸€濓紝鑰屾槸鑳界洿鎺ヤ粠澶嶄範鐣岄潰璺冲洖鍙畾浣嶇殑鏉ユ簮宸ヤ綔鍙帮紝鍑忓皯鍦ㄨ祫鏂欍€佺瑪璁般€佸浘璋便€丄I 涓庡涔犱箣闂存潵鍥炴柇閾剧殑鎯呭喌銆?
### 瀹為檯鍙樻洿

- 鏂板 `frontend-user/src/modules/review/reviewSourceBacklinks.ts`锛屽鐢ㄥ浘璋辨潵婧愬弽閾炬槧灏勮兘鍔涳紝缁熶竴鎶婂涔犲崱鐗囩殑 `sourceType / sourceId` 瑙ｆ瀽鎴愬彲灞曠ず鐨勬潵婧愭憳瑕佷笌鍙洿杈惧伐浣滃彴鐩爣銆?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屼负褰撳墠澶嶄範鍗＄墖鍜屽崱缁勫崱鐗囧垪琛ㄩ兘鎺ュ叆鏉ユ簮鎽樿鍖猴紱褰撴潵婧愭槸绗旇銆佽祫鏂欍€佸崱鐗囩瓑鍙洿鎺ュ畾浣嶇殑绫诲瀷鏃讹紝澶嶄範椤典細鏄剧ず鍥炶烦閾炬帴锛涘綋鏉ユ簮鍍忔壒娉ㄨ繖绫讳粛缂哄皯棰濆涓婁笅鏂囨椂锛屽垯鏄庣‘鎻愮ず鈥滄殏涓嶆敮鎸佺洿杈锯€濓紝閬垮厤鍑虹幇璇鎬у亣閾炬帴銆?- 鏂板 `frontend-user/src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx`锛岃鐩?`/review?card=card-1` 鍦烘櫙涓嬪綋鍓嶅崱鐗囦笌绠＄悊渚ф爮鍗＄墖鍒楄〃鐨勬潵婧愬洖璺抽摼鎺ユ覆鏌擄紝閿佸畾杩欐潯澶嶄範鏉ユ簮鍏ュ彛涓嶅啀閫€鍖栥€?- 鏇存柊 `frontend-user/src/styles/studio-workspaces.css`锛岃ˉ鍏呭涔犳潵婧愭憳瑕併€佺揣鍑戞€佹潵婧愭潯鍜屾潵婧愰摼鎺ユ牱寮忥紝璁╂潵婧愬叆鍙ｅ彲瑙佷絾涓嶆尋鍗犱富澶嶄範鍔ㄤ綔鍖哄煙銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030 / LC-010` 鐨勮鏄庢帹杩涘埌鈥滃涔犻〉鍐呯殑鏉ユ簮鍥炵湅鍏ュ彛宸叉帴涓娾€濊繖涓€闃舵銆?
### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
- `npm run verify:docs`
- `git diff --check`

### 鍚庣画褰卞搷

- `ANKI-030` 鐜板湪涓嶄粎鏀寔鈥滄妸鏉ユ簮鍗＄墖娣遍摼鎷夊洖澶嶄範椤碘€濓紝涔熸敮鎸佷粠澶嶄範椤电户缁洖鍒扮瑪璁般€佽祫鏂欏拰鍗＄墖绛夊彲鐩磋揪鏉ユ簮宸ヤ綔鍙帮紝涓诲涔犻棴鐜噷鐨勨€滃涔?-> 鏉ユ簮鍥炵湅鈥濆張闂悎浜嗕竴娈点€?- 杩欎竴杞粛鏈В鍐虫壒娉?PDF 閿氱偣杩欑被闇€瑕侀澶?`materialId` 涓婁笅鏂囩殑鏉ユ簮鐩磋揪锛屽洜涓哄綋鍓嶅涔犲崱鐗?payload 鍙湁 `sourceType / sourceId`锛涘悗缁鏋滆鎶婅繖绫绘潵婧愪篃鐪熸鎵撻€氾紝鏇撮€傚悎缁х画娌?`ANKI-050 / LC-010` 缁欏崱鐗囪ˉ鍏呮洿瀹屾暣鐨?SourceLink 涓婁笅鏂囧瓧娈碉紝鑰屼笉鏄湪鍓嶇鐚滄祴鏉ユ簮璺緞銆?
## 2026-07-15 06:12:00 +08:00 | v1.1.0-alpha.244 | 鎺ㄨ繘 ANKI-050 / LC-010 鎵规敞鏉ユ簮鍗＄墖鍥炶烦涓婁笅鏂?### 浠诲姟鍐呭

- 缁х画鎸夌収 `CODEX_MASTER_PROMPT.md` 鐨勨€滀紭鍏堟妸涓诲涔犺矾寰勫仛鎴愬彲鐢ㄧ増锛屽啀閫愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-050 / LC-010`锛岃繖涓€杞笉鎵╂暎鍒版柊鐨勫浘璋辨垨鍚庡彴瀛愬煙锛岃€屾槸鎶婁笂涓€杞槑纭毚闇茬殑鎵规敞鏉ユ簮鍥炶烦缂哄彛鐪熸琛ラ綈銆?- 鐩爣鏄 `reader -> 鎵规敞鐢熸垚鍗＄墖鑽夌 -> 纭鍏?deck -> review 闃熷垪 -> 鍥炶烦 reader 鎵规敞浣嶇疆` 杩欎竴鏉￠摼璺笉鍐嶅湪涓€斾涪澶?`materialId / page / annotationId` 涓婁笅鏂囷紝閬垮厤澶嶄範椤靛彧鑳芥彁绀衡€滆繖鏄壒娉ㄦ潵婧愨€濆嵈鏃犳硶鐪熸瀹氫綅鍥炲師鏂囥€?
### 瀹為檯鍙樻洿

- 鍚庣涓?`card` 鍩熻ˉ鍏?`sourceMetadata` 閫氳矾锛氭洿鏂?`backend/internal/modules/card/dto/card.go`銆乣backend/internal/modules/card/model/card.go`銆乣backend/internal/modules/card/repository/repository.go`銆乣backend/internal/modules/card/service/service.go`锛岃寤哄崱璇锋眰銆佹寔涔呭寲鍗＄墖涓庝粖鏃ュ涔犻槦鍒楅兘鑳戒繚鐣欏苟杩斿洖鏉ユ簮涓婁笅鏂囥€?- 鏂板 `backend/internal/modules/card/repository/source_metadata.go` 涓?MySQL 杩佺Щ `backend/internal/migrations/mysql/005_card_source_metadata.sql`锛堝強 down migration锛夛紝鎶婂崱鐗囨潵婧愪笂涓嬫枃浠?JSON 鏂囨湰褰㈠紡钀藉簱锛屽吋瀹圭幇鏈?`sourceType / sourceId` 鍗＄墖銆?- 閲嶅啓 `backend/internal/modules/reader/service/card_drafts.go`锛岃鎵规敞鍒跺崱鑽夌榛樿鎼哄甫 `materialId / annotationId / page`锛涘悓鏃舵洿鏂?`backend/internal/modules/ai/service/service.go`锛岃 reader/note 鐢熸垚鐨?AI 鑽夌鍦ㄨ褰曚笌鍥炰紶鏃朵篃涓嶄細涓㈡帀杩欎唤鏉ユ簮 metadata銆?- 鍓嶇鏇存柊 `frontend-user/src/api/types.ts`銆乣frontend-user/src/api/review.ts`銆乣frontend-user/src/app/appShared.tsx`銆乣frontend-user/src/features/ai/aiDrafts.ts` 涓?`frontend-user/src/modules/review/reviewSourceBacklinks.ts`锛岃鑽夌纭銆丄I 鑽夌寤哄崱涓庡涔犻〉鏉ユ簮鍥炶烦閮芥秷璐瑰悓涓€浠?`sourceMetadata`锛屼粠鑰屾妸鎵规敞鏉ユ簮鐪熸鍥炶烦鍒?`/reader/:materialId?page=...&annotation=...`銆?- 琛ュ厖骞舵敹鏁涙祴璇曪細鏂板 `backend/internal/modules/card/service/source_metadata_test.go`銆乣frontend-user/src/features/ai/aiDrafts.test.ts`锛屽苟鎵╁睍 `backend/internal/modules/reader/service/card_drafts_test.go`銆乣frontend-user/src/app/appShared.test.tsx`銆乣frontend-user/src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx`锛屽厛澶嶇幇 metadata 涓㈠け锛屽啀楠岃瘉 reader 鎵规敞鍥炶烦宸茬粡鎵撻€氥€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-050` 鎺ㄨ繘鍒?`IN_PROGRESS`锛屽苟鍚屾璁板綍 `LC-010` 宸茶ˉ涓娾€滄壒娉ㄦ潵婧愬崱鐗囧洖璺冲埌 reader 鎵规敞浣嶇疆鈥濊繖涓€闃舵銆?
### 楠岃瘉缁撴灉

- `go test ./internal/modules/reader/service ./internal/modules/card/service`
- `go test ./internal/modules/ai/service ./internal/modules/card/... ./internal/modules/reader/...`
- `npm test -- --run src/app/appShared.test.tsx src/features/ai/aiDrafts.test.ts src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx`
- `npm run typecheck`
- `npm run build`

### 鍚庣画褰卞搷

- `ANKI-050` 鐜板湪宸茬粡涓嶅彧鏄€滃崱鐗囩煡閬撹嚜宸辨潵鑷壒娉ㄢ€濓紝鑰屾槸鑳芥妸鎵规敞鏉ユ簮涓婁笅鏂囩ǔ瀹氱┛杩囪崏绋跨‘璁ゃ€丄I 鑽夌纭銆佸缓鍗′笌澶嶄範鍥炵湅杩欐潯閾捐矾锛屼富瀛︿範闂幆閲岀殑 `reader -> review -> reader` 鍙堥棴鍚堜簡涓€娈点€?- 杩欎竴杞粛鍙ˉ榻愪簡鎵规敞鏉ユ簮锛涘鏋滆鎶?PDF 閿氱偣銆佸浘璋辫妭鐐规潵婧愬拰鏇撮€氱敤鐨?SourceLink 璇箟涔熺粺涓€璧锋潵锛屼笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-050 / LC-010 / WB-033` 鎵╁睍鍚屼竴濂?`sourceMetadata`/SourceLink 妯″瀷锛岃€屼笉鏄洖鍒板墠绔仛涓€娆℃€ц矾寰勭寽娴嬨€?
## 2026-07-15 06:18:00 +08:00 | v1.1.0-alpha.245 | 鎺ㄨ繘 ANKI-050 / LC-010 鍥捐氨鏉ユ簮鍗＄墖涓婁笅鏂囬€忎紶
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-050 / LC-010`锛岃繖涓€杞笉鍙﹁捣鏂扮殑瀛愬煙锛岃€屾槸鎶婁笂涓€杞?reader 鎵规敞鏉ユ簮鑳藉姏缁х画鎵╁睍鍒?`graph -> card -> review` 杩欐潯閾俱€?- 鐩爣鏄伩鍏嶅浘璋辫妭鐐圭敓鎴愬崱鐗囨椂鍐嶆涓㈠け鏉ユ簮涓婁笅鏂囷紝鐗瑰埆鏄?`pdf-anchor` 鍜屾惡甯?reader metadata 鐨勮妭鐐癸紝纭繚瀹冧滑杩涘叆澶嶄範闃熷垪鍚庝粛鐒惰兘璺冲洖 reader 鐨勫師濮嬪畾浣嶄綅缃€?
### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/graph/service/helpers.go`锛屼负 `BuildCardCreateRequests(...)` 琛ヤ笂缁熶竴鐨勬潵婧愯В鏋愪笌 metadata 鎻愬彇閫昏緫锛屼笉鍐嶅彧渚濊禆 `node.Source` 鎴?`metadata.content` 閲屽皯鏁板嚑涓瓧娈点€?- 鏂板鍥捐氨鍗＄墖鏉ユ簮涓婁笅鏂囪В鏋愶細褰撹妭鐐规湰韬凡鏈?`source` 鏃讹紝浼氬悓鏃舵暣鐞嗗搴旂殑 `sourceMetadata`锛涘綋鑺傜偣娌℃湁 `source` 浣嗚妭鐐圭被鍨嬫槸 `pdf-anchor` 涓?metadata 鍚?`pdfAnchor / pdfPage / materialId` 鏃讹紝鐜板湪涔熻兘姝ｇ‘鎺ㄦ柇鎴?`pdf-anchor` 鏉ユ簮锛岃€屼笉鏄敊璇檷绾ф垚 `material`銆?- 杩欎竴灞傝繕浼氭妸 reader/PDF 鍥炶烦鎵€闇€瀛楁瑙勮寖鎴愬崱鐗囧彲娑堣垂鐨?metadata锛屼緥濡?`materialId`銆乣page`銆乣annotationId`銆乣anchorId`锛屼粠鑰屼笌涓婁竴杞ˉ濂界殑 `card/review` SourceLink 閫氳矾鐩存帴瀵规帴銆?- 鎵╁睍 `backend/internal/modules/graph/service/helpers_test.go`锛岃ˉ涓娾€滃浘璋辫妭鐐?reader metadata 涓嶅簲涓㈠け鈥濆拰鈥減df-anchor 鑺傜偣涓嶅簲琚檷绾ф垚 material 鏉ユ簮鈥濈殑 RED/GREEN 鍥炲綊锛涘悓姝ユ墿灞?`frontend-user/src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx`锛岃鐩?`pdf-anchor` 鍗＄墖鍦ㄥ涔犻〉閲岀殑 reader 鍥炶烦銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-050 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥滃浘璋辫妭鐐硅浆鍗′篃寮€濮嬩繚鐣?reader/PDF 閿氱偣涓婁笅鏂団€濄€?
### 楠岃瘉缁撴灉

- `go test ./internal/modules/graph/service`
- `go test ./internal/modules/graph/... ./internal/modules/card/service ./internal/modules/reader/service`
- `npm test -- --run src/modules/review/ReviewWorkspacePage.sourceLinks.test.tsx`

### 鍚庣画褰卞搷

- 鐜板湪涓嶅彧鏄?reader 鐩存帴鐢熸垚鐨勫崱鐗囪兘鍥炶烦鍘熸枃锛屽浘璋辫妭鐐瑰啀杞垚澶嶄範鍗℃椂锛屼篃寮€濮嬩繚鐣?reader/PDF 鏉ユ簮涓婁笅鏂囷紝涓诲涔犻棴鐜噷鐨?`reader -> graph -> review -> reader` 鍙堥棴鍚堜簡涓€娈点€?- 杩欎竴杞粛涓昏瑕嗙洊 `pdf-anchor` 涓庡凡鏈?reader metadata 鐨勮妭鐐癸紱濡傛灉瑕佹妸鏇村鍥捐氨鑺傜偣鏉ユ簮銆佺瑪璁板潡妯℃澘鍖栨潵婧愬拰鏇寸粺涓€鐨?SourceLink 鎶借薄缁х画鍋氬帤锛屼笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-050 / WB-033 / LC-010` 鎶婂崱鐗囨潵婧愯В鏋愪粠 helper 绾ц兘鍔涙帹骞垮埌鏇村畬鏁寸殑 CardNote/SourceLink 濂戠害銆?## 2026-07-15 06:22:47 +08:00 | v1.1.0-alpha.246 | 鎺ㄨ繘 ANKI-050 / LC-010 AI 宸ヤ綔鍙版繁閾惧畾浣?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-050 / LC-010`锛岃繖涓€杞笉鎵╂暎鍒版柊鐨勫浘璋辨垨鍚庡彴瀛愬煙锛岃€屾槸鎶婁笂涓€杞凡缁忎骇鍑虹殑 AI 鏉ユ簮娣遍摼鐪熸鎺ュ埌宸ヤ綔鍙拌惤鐐逛笂銆?- 鐩爣鏄鍥捐氨鏉ユ簮鍗＄墖銆佸涔犳潵婧愬叆鍙ｇ瓑鍦烘櫙鐢熸垚鐨?`/ai?draft=<id>` 涓?`/ai?task=<id>` 涓嶅啀鍙妸鐢ㄦ埛甯﹀埌绗肩粺鐨?AI 椤甸潰锛岃€屾槸浼樺厛瀹氫綅鍒扮洰鏍囪崏绋挎垨浠诲姟锛岃鈥滄潵婧愬洖鐪?-> AI 宸ヤ綔鍙扮‘璁?澶嶆煡鈥濊繖娈甸摼璺湡姝ｅ彲鐢ㄣ€?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/pages/AiPage.tsx`锛屾帴鍏?`useLocation()` 涓庢煡璇㈠弬鏁拌В鏋愶紝鏂板閫氱敤鐨勭洰鏍囬」浼樺厛鎺掑簭 helper锛岃 AI 鑽夌鍒楄〃鍜屼换鍔″巻鍙查兘鑳芥牴鎹?`draft` / `task` 鏌ヨ鍙傛暟鎶婃寚瀹氶」鎻愬崌鍒伴浣嶃€?- 鍚屼竴椤甸潰鏂板娣遍摼鍙嶉鏂囨锛氬綋鎸囧畾 AI 鑽夌鎴栦换鍔″瓨鍦ㄦ椂锛屽伐浣滃彴浼氭槑纭彁绀哄凡瀹屾垚瀹氫綅锛涜嫢鐩爣涓嶅瓨鍦紝鍒欏洖钀藉埌榛樿宸ヤ綔鍙拌鍥惧苟缁欏嚭鏈懡涓殑璇存槑锛岄伩鍏嶇敤鎴疯浠ヤ负娣遍摼宸茬粡鐢熸晥銆?- 鎵╁睍 `frontend-user/src/pages/AiPage.test.tsx`锛岃ˉ涓?`/ai?draft=draft-card-2` 涓?`/ai?task=task-2` 涓や釜鍥炲綊鍦烘櫙锛岄攣瀹氣€滅洰鏍囪崏绋?浠诲姟搴旇浼樺厛鍛堢幇涓旂粰鍑烘纭彁绀衡€濈殑琛屼负銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-050 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥淎I 宸ヤ綔鍙颁篃鑳芥秷鍖栨潵婧愭繁閾惧苟浼樺厛瀹氫綅鎸囧畾鑽夌/浠诲姟鈥濊繖涓€灞傘€?### 楠岃瘉缁撴灉

- `npm test -- --run src/pages/AiPage.test.tsx`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
### 鍚庣画褰卞搷

- `ANKI-050` 鐜板湪涓嶄粎鑳芥妸鏉ユ簮涓婁笅鏂囧甫鍒?AI 宸ヤ綔鍙帮紝杩樿兘璁╁伐浣滃彴鐪熸鍚冩帀杩欎簺涓婁笅鏂囧苟鎶婄敤鎴疯惤鍒版寚瀹氳崏绋?浠诲姟涓婏紝涓诲涔犻棴鐜噷鐨?`graph/review -> AI workspace` 鍙堥棴鍚堜簡涓€娈点€?- 杩欎竴杞粛鍙В鍐充簡鈥滆繘鍏?AI 宸ヤ綔鍙版椂鍏堢湅瀵瑰璞♀€濈殑闂锛涘鏋滃悗缁缁х画琛ラ綈鏇寸粺涓€鐨?`SourceLink` 鎶借薄銆佹洿寮虹殑鑽夌鏉ユ簮棰勮锛屾垨鎶?AI 纭缁撴灉缁х画绋冲畾鍥炲啓鍒板浘璋?澶嶄範鍙嶉锛屼笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-050 / WB-033 / LC-010` 鎵╁睍鍚屼竴鏉′富绾裤€?## 2026-07-15 06:34:40 +08:00 | v1.1.0-alpha.248 | 鎺ㄨ繘 ANKI-050 / LC-010 AI 鑽夌鏉ユ簮绮剧‘鍥炶烦
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-050 / LC-010`锛岃繖涓€杞笉鎵╂暎鍒版柊鐨勯鍩熸ā鍨嬶紝鑰屾槸鏀跺彛 AI 鑽夌纭椤甸噷浠嶇劧鍋忕矖绮掑害鐨勬潵婧愬洖璺炽€?- 鐩爣鏄宸茬粡甯︾潃 `sourceMetadata` 杩涘叆 AI 宸ヤ綔鍙扮殑鎵规敞鍜?PDF 閿氱偣鏉ユ簮锛屼笉鍐嶅彧鍋滅暀鍦ㄢ€滄墦寮€鏉ユ簮宸ヤ綔鍙扳€濈殑瀹芥硾鍏ュ彛锛岃€屾槸鑳戒粠 AI 鑽夌鐩存帴绮剧‘鍥炲埌 reader 鐨勯〉鐮併€佹壒娉ㄦ垨閿氱偣浣嶇疆銆?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/features/ai/aiDrafts.ts`锛岃 `buildAiDraftWorkspacePath(...)` 浼樺厛澶嶇敤鐜版湁 `graphSourceBacklinks` 鐨勬潵婧愯В鏋愯鍒欙紝鍐嶅湪 `graph` 绛夊皯鏁?helper 涓嶈鐩栫殑绫诲瀷涓婂洖閫€鍒版棦鏈夌畝鍗曡矾寰勩€?- 杩欐牱涓€鏉ワ紝`annotation` 涓?`pdf-anchor` 绫诲瀷鐨?AI 鑽夌鏉ユ簮閾炬帴鐜板湪浼氫繚鐣?`materialId / page / annotationId / anchorId` 绛変笂涓嬫枃锛岀敓鎴愮簿纭殑 reader 鍥炶烦鍦板潃锛岃€屼笉鏄洿鎺ヤ涪鎴愮┖閾炬帴鎴栧彧鍥炲埌璧勬枡棣栭〉銆?- 鎵╁睍 `frontend-user/src/features/ai/aiDrafts.test.ts` 涓?`frontend-user/src/pages/AiPage.test.tsx`锛岃ˉ涓?annotation / pdf-anchor 鏉ユ簮璺緞涓?AI 椤甸潰鐪熷疄閾炬帴娓叉煋鐨?RED/GREEN 鍥炲綊銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-050 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥淎I 鑽夌纭椤甸噷鐨勬潵婧愬洖璺充篃宸叉帴鍏ョ簿纭?reader 瀹氫綅鈥濄€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/features/ai/aiDrafts.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/features/ai/aiDrafts.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `ANKI-050` 鐜板湪涓嶄粎鑳芥妸鎵规敞/PDF 涓婁笅鏂囧甫杩涘崱鐗囧拰澶嶄範锛屼篃鑳借 AI 鑽夌纭椤电户缁秷璐硅繖濂椾笂涓嬫枃骞跺洖鍒?reader 绮剧‘浣嶇疆锛屼富瀛︿範闂幆閲岀殑 `reader -> AI workspace -> reader` 鍙堥棴鍚堜簡涓€娈点€?- 杩欎竴杞粛鍙敹鍙ｄ簡 AI 鑽夌鏉ユ簮閾炬帴锛涘鏋滃悗缁缁х画鎶?AI 浠诲姟鍘嗗彶銆佹洿澶氬浘璋辨潵婧愮被鍨嬪拰鏇寸粺涓€鐨?`SourceLink` 濂戠害缁х画鍋氬帤锛屼笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-050 / WB-033 / LC-010` 鎵╁悓涓€濂楁潵婧愬洖璺虫ā鍨嬶紝鑰屼笉鏄湪鍚勯〉闈㈢户缁爢鐙珛璺緞鍒ゆ柇銆?## 2026-07-15 06:41:01 +08:00 | v1.1.0-alpha.249 | 鎺ㄨ繘 ANKI-050 / LC-010 AI 浠诲姟鍘嗗彶鏉ユ簮绮剧‘鍥炶烦
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-050 / LC-010`锛岃繖涓€杞湪 AI 鑽夌纭椤佃ˉ瀹屼箣鍚庯紝缁х画鎶?AI 浠诲姟鍘嗗彶涔熺撼鍏ュ悓涓€濂楁潵婧愬洖璺充富绾裤€?- 鐩爣鏄伩鍏?AI 浠诲姟鍘嗗彶鍙墿 `sourceType/sourceId` 杩欑绮楃矑搴︿俊鎭紝灏ゅ叾鍦?reader 鎵规敞鐢熸垚鍗＄墖鑽夌杩欑被鍦烘櫙閲岋紝鐢ㄦ埛搴旇兘浠庘€滄渶杩?AI 浠诲姟鈥濈洿鎺ュ洖鍒扮簿纭殑椤电爜涓庢壒娉ㄤ綅缃€?### 瀹為檯鍙樻洿

- 鍚庣琛ラ綈 AI 浠诲姟 `sourceMetadata` 閫氳矾锛氭洿鏂?`backend/internal/modules/ai/model/ai_task.go`銆乣dto/ai.go`銆乣repository/repository.go`銆乣service/service.go`锛屽苟鏂板 `backend/internal/modules/ai/repository/source_metadata.go`锛岃浠诲姟璁板綍鍙互鎸佷箙鍖栧苟杩斿洖鏉ユ簮涓婁笅鏂囥€?- 鏂板 MySQL 杩佺Щ `backend/internal/migrations/mysql/006_ai_task_source_metadata.sql`锛堝強 down migration锛夛紝涓?`ai_tasks` 琛ㄨˉ涓?`source_metadata` 鏂囨湰鍒楋紝鍏煎宸叉湁浠诲姟琛ㄧ粨鏋勩€?- `RecordReaderCardDrafts(...)` 涓?`RecordReaderGraphDrafts(...)` 鐜板湪浼氭妸棣栦釜鍙敤鐨?reader 鏉ユ簮 metadata 鎻愬崌鍒颁换鍔¤褰曞眰锛涜繖鏍?AI 浠诲姟鍘嗗彶閲岀殑 reader 浠诲姟涔熻兘淇濈暀 `materialId / page / annotationId / anchorId`銆?- 鍓嶇鏇存柊 `frontend-user/src/api/types.ts`銆乣frontend-user/src/features/ai/aiDrafts.ts` 涓?`frontend-user/src/pages/AiPage.tsx`锛氭柊澧?`buildAiTaskWorkspacePath(...)`锛屽苟鍦ㄢ€滄渶杩?AI 浠诲姟鈥濆崱鐗囬噷娓叉煋 `鎵撳紑鏉ユ簮宸ヤ綔鍙癭 閾炬帴锛岀洿鎺ュ鐢ㄦ棦鏈?`graphSourceBacklinks` 瑙勫垯鐢熸垚绮剧‘ reader 鍥炶烦鍦板潃銆?- 琛ュ己鍥炲綊锛氭柊澧炲悗绔?`backend/internal/modules/ai/service/source_metadata_test.go`锛屽苟鎵╁睍 `frontend-user/src/features/ai/aiDrafts.test.ts`銆乣frontend-user/src/pages/AiPage.test.tsx`锛岄攣瀹氫换鍔＄骇鏉ユ簮涓婁笅鏂囦笌椤甸潰閾炬帴娓叉煋銆?### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/ai/service`
- RED锛歚npm --workspace frontend-user run test -- src/features/ai/aiDrafts.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- GREEN锛歚go test ./internal/modules/ai/service ./internal/modules/ai/handler`
- GREEN锛歚npm --workspace frontend-user run test -- src/features/ai/aiDrafts.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/pages/AiPage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `ANKI-050` 鐜板湪涓嶄粎瑕嗙洊 AI 鑽夌纭椤碉紝涔熸妸 AI 浠诲姟鍘嗗彶鎷夎繘浜嗗悓涓€濂楁潵婧愬洖璺宠涔夛紝涓诲涔犻棴鐜噷鐨?`reader -> AI task history -> reader` 涔熷紑濮嬪彲鐢ㄤ簡銆?- 杩欎竴杞粛涓昏瑕嗙洊 reader 渚х簿纭潵婧愶紱濡傛灉鍚庣画瑕佺户缁妸鏇村鍥捐氨鏉ユ簮绫诲瀷銆佷换鍔＄粨鏋滃洖璺冲拰鏇寸粺涓€鐨?`SourceLink` 濂戠害缁х画鍋氬帤锛屼笅涓€姝ユ洿閫傚悎缁х画娌?`ANKI-050 / WB-033 / LC-010` 鎵╁睍杩欎竴灞傦紝鑰屼笉鏄湪浠诲姟鍗＄墖閲岀户缁爢涓存椂瀛楁鍒ゆ柇銆?## 2026-07-15 06:29:26 +08:00 | v1.1.0-alpha.247 | 澶嶆牳 FE-010 / FE-020 / FE-030 / UI-04 褰撳墠鐜楠岃瘉
### 浠诲姟鍐呭

- 鎸?`CODEX_MASTER_PROMPT.md` 鐨勬帴鎵嬫牳楠岃姹傦紝浼樺厛澶嶆牳宸叉敹鍙ｇ殑鍓嶇宸ヤ綔鍖呭湪褰撳墠鐜涓嬫槸鍚︿粛鐒舵垚绔嬶紝閬垮厤鎶婂巻鍙?`DONE` 缁撹寤虹珛鍦ㄨ繃鏈熼獙璇佷笂銆?- 鐩爣涓嶆槸寮€鍚柊鍔熻兘锛岃€屾槸纭澶氬竷灞€澹冲眰銆佸浘璋?CanvasLayout銆侀槄璇?绗旇/澶嶄範宸ヤ綔鍖轰綋楠屽拰鍚庡彴娌荤悊宸ヤ綔鍙拌繖鍑犳潯涓昏矾寰勫湪褰撳墠浠ｇ爜涓嬩緷鏃у彲閫氳繃鏈€灏忛獙璇侀棴鐜€?### 瀹為檯鍙樻洿

- 澶嶈窇 FE-010 / FE-020 / FE-030 / UI-04 褰撴椂鐨勬渶灏忛獙璇佸懡浠ょ粍锛屽寘鎷墠鍚庡彴绫诲瀷妫€鏌ャ€乂itest銆佺敤鎴风/绠＄悊绔瀯寤猴紝浠ュ強 `user shell`銆乣graph workspace`銆乣review flow`銆乣admin governance` 鍥涙潯 Playwright smoke銆?- 鏇存柊 `e2e/user-shell.spec.ts`锛屾妸棣栭〉 `鎵撳紑璧勬枡搴揱 鏂█鏀逛负鍏煎鍚屽悕 CTA 鍏卞瓨鐨勭ǔ瀹氶€夋嫨鍣紝閬垮厤褰撳墠 dashboard 鍦?section action 涓?empty-state CTA 鍚屾椂鍑虹幇鏃惰Е鍙?strict mode 璇姤銆?- 鏇存柊 `e2e/v1-admin-governance.spec.ts`锛岃鍚庡彴娌荤悊瀵艰埅鐐瑰嚮瀵归綈褰撳墠 `AdminNavItem` 鐨勭湡瀹?`data-admin-nav-item-view` 閽╁瓙锛岃€屼笉鍐嶄緷璧栧凡缁忛€€褰圭殑鏃у睘鎬у悕銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛岃拷鍔犳湰杞鏍歌褰曪紝鏄庣‘杩欐淇殑鏄祴璇曢挬瀛愭紓绉伙紝涓嶆槸浜у搧琛屼负鍥為€€銆?### 楠岃瘉缁撴灉

- `npm --workspace frontend-user run typecheck`
- `npm --workspace frontend-admin run typecheck`
- `npm --workspace frontend-user run test -- src/app/layouts/layoutPolicy.test.ts src/app/layouts/AppShell.test.tsx src/design-system/primitives/DataState.test.tsx src/design-system/primitives/Drawer.test.tsx src/design-system/primitives/Inspector.test.tsx src/modules/graph/components/GraphWorkspaceCanvasChrome.test.tsx src/pages/ReaderPage.test.tsx src/pages/NotesPage.test.tsx src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-admin run test -- src/views/AdminWorkspaceView.test.ts`
- `npm run build:user`
- `npm run build:admin`
- `npx playwright test e2e/user-shell.spec.ts e2e/v1-graph-workspace.spec.ts e2e/v1-review-flow.spec.ts e2e/v1-admin-governance.spec.ts`
### 鍚庣画褰卞搷

- 褰撳墠鐜涓?`FE-010 / FE-020 / FE-030 / UI-04` 鐨勬渶灏忛獙璇侀摼鏉′粛鐒跺彲閫氳繃锛岃鏄庤繖浜涘凡鏀跺彛宸ヤ綔鍖呮病鏈夊洜涓鸿繎鏈熶富璺緞杩唬鑰屽彂鐢熺湡瀹炲洖閫€銆?- 杩欐鏆撮湶鐨勯棶棰樺睘浜庤嚜鍔ㄥ寲閫夋嫨鍣ㄩ殢 UI 璇箟婕旇繘浜х敓鐨勮交寰紓绉伙紱鍚庣画濡傛灉缁х画鎺ㄨ繘棣栭〉 CTA銆佸悗鍙板鑸垨娌荤悊妯″潡楠ㄦ灦锛屽簲璇ュ悓姝ョ淮鎶?Playwright 绋冲畾閽╁瓙锛岄伩鍏嶆妸娴嬭瘯鍣０璇垽鎴愪骇鍝佸洖閫€銆?## 2026-07-15 06:46:36 +08:00 | v1.1.0-alpha.250 | 鎺ㄨ繘 ANKI-030 澶嶄範璺宠繃褰撳墠鍗＄墖
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-030 / LC-010`锛岃繖涓€杞笉鎵╂暎鍒版柊鐨勮皟搴︽ā鍨嬫垨鍚庡彴鍩燂紝鑰屾槸鍏堣ˉ榻愬涔犱細璇濋噷鏈€杞婚噺銆佹渶鐩存帴褰卞搷鍙敤鎬х殑鎿嶄綔缂哄彛銆?- 鐩爣鏄鐢ㄦ埛鍦ㄥ涔犺繃绋嬩腑閬囧埌鈥滆繖寮犲厛鏀惧悗闈㈠啀鐪嬧€濈殑鍦烘櫙鏃讹紝涓嶅繀閫€鍑哄綋鍓嶄細璇濓紝涔熶笉浼氱牬鍧忓綋鍓嶅緟瀹屾垚闃熷垪鐨勪笂涓嬫枃銆?### 瀹為檯鍙樻洿

- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屾柊澧?`handleSkipCurrent()`锛屽湪褰撳墠鍗＄墖鍙烦杩囦笖闃熷垪闀垮害澶т簬 1 鏃讹紝鎶婂綋鍓嶅崱鐗囬『寤跺埌鍐呭瓨闃熷垪鏈熬锛屽苟绔嬪嵆鍒囧埌涓嬩竴寮犲崱銆?- 澶嶄範鍗＄墖鎿嶄綔鍖烘柊澧?`璺宠繃褰撳墠鍗＄墖` 鎸夐挳锛屽苟琛ヤ笂 `S` 閿揩鎹疯矾寰勶紱璺宠繃鍚庝細鏄剧ず鈥滃凡璺宠繃褰撳墠鍗＄墖锛岀◢鍚庝細鍥炲埌杩欏紶鍗°€傗€濇彁绀猴紝鍚屾椂淇濇寔寰呭畬鎴愬紶鏁颁笉鍙樸€?- 鎵╁睍 `frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛岀敤 RED/GREEN 鍥炲綊閿佸畾鈥滆烦杩囧綋鍓嶅崱鐗囧悗鍒囧埌涓嬩竴寮犮€佸師鍗＄墖鎺掑埌闃熷熬銆佸緟瀹屾垚璁℃暟涓嶅彉鈥濈殑琛屼负銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥滃涔犱細璇濆凡鍏峰璺宠繃褰撳墠鍗＄墖涓斾繚鐣欓槦鍒椾笂涓嬫枃鈥濊繖涓€灞傘€?### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `ANKI-030` 鐨勫涔犱細璇濈幇鍦ㄥ凡缁忓叿澶囦竴涓洿鎺ヨ繎鐪熷疄 Anki 浣跨敤涔犳儻鐨勨€滃厛璺宠繃銆佺◢鍚庡洖鏉モ€濆叆鍙ｏ紝涓诲涔犻棴鐜噷鐨勫涔犻樁娈靛彲鐢ㄦ€ф洿瀹屾暣浜嗕竴姝ャ€?- 杩欎竴杞粛鍙鐩栧墠绔唴瀛橀槦鍒楀眰鐨?defer 浣撻獙锛涘悗缁洿閫傚悎缁х画娌?`ANKI-030 / ANKI-020 / LC-010` 琛ユ挙閿€涓婁竴娆¤瘎鍒嗐€佸煁钘?鏆傚仠鍗＄墖锛屼互鍙婁笌鐪熷疄璋冨害鐘舵€佷竴鑷寸殑闃熷垪璇箟锛岃€屼笉鏄妸鏇村浼氳瘽鍒嗘敮缁х画鍫嗚繘椤甸潰鏉′欢鍒ゆ柇閲屻€?## 2026-07-15 06:56:42 +08:00 | v1.1.0-alpha.251 | 鎺ㄨ繘 ANKI-030 澶嶄範鏆傚仠涓庢仮澶嶅崱鐗?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-030 / LC-010`锛岃繖涓€杞笉鐩存帴涓婃洿閲嶇殑 Note/Card 閲嶆瀯鎴栧畬鏁磋皟搴︽ā鍨嬶紝鑰屾槸鍏堣ˉ榻愬涔犱細璇濋噷鍙︿竴涓珮棰戙€佸彲鐩存帴鎰熺煡鐨勬帶鍒跺姩浣溿€?- 鐩爣鏄鐢ㄦ埛鍦ㄥ涔犺繃绋嬩腑鍙互鎶婂綋鍓嶄笉鎯崇户缁仛鐨勫崱鐗囧厛鏆傚仠鎺夛紝绔嬪嵆浠庝粖鏃ユ椿璺冮槦鍒楃Щ闄わ紝骞朵笖浠嶈兘鍦ㄥ悓涓€宸ヤ綔鍙伴噷鎭㈠鍥炴潵锛屼笉蹇呯寮€澶嶄範涓婁笅鏂囥€?### 瀹為檯鍙樻洿

- 鍚庣琛ラ綈鍗＄墖鐘舵€佹洿鏂伴€氳矾锛氫负 `card` 妯″潡鏂板 `PATCH /api/v1/cards/:id/status` 濂戠害锛屽厑璁稿湪 `active / suspended` 涓ょ鐘舵€侀棿鍒囨崲锛沗TodayQueue(...)` 缁х画鍙媺鍙?`active` 鍗＄墖锛屽洜姝ゆ殏鍋滃悗浼氳嚜鐒剁寮€浠婃棩闃熷垪銆?- 鏇存柊 `backend/internal/modules/card/service/service.go`銆乣handler/handler.go`銆乣router/router.go`銆乣repository/repository.go` 涓?`dto/card.go`锛岃ˉ涓婄姸鎬佹牎楠屻€佹墍鏈夋潈鏍￠獙銆佺姸鎬佹寔涔呭寲涓庡璁℃棩蹇楋紝淇濇寔鍙樻洿浠嶇劧鏀跺彛鍦?card 鍩熷唴閮ㄣ€?- 鏇存柊 `frontend-user/src/api/review.ts` 涓?`frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛氬涔犲崱鐗囨搷浣滃尯鏂板 `鏆傚仠褰撳墠鍗＄墖` 鎸夐挳鍜?`P` 蹇嵎閿紱鏆傚仠鍚庡綋鍓嶅崱鐗囦細浠庝粖鏃ユ椿璺冮槦鍒楃Щ闄ゃ€佸緟瀹屾垚璁℃暟鍚屾鍑忓皯锛屽苟鎻愮ず鍙湪绠＄悊闈㈡澘鎭㈠銆?- 绠＄悊闈㈡澘涓殑鍗＄墖鍒楄〃鏂板鐘舵€佹爣绛惧拰 `鏆傚仠鍗＄墖 / 鎭㈠鍗＄墖` 鍔ㄤ綔锛涙仮澶嶆椂浼氶噸鏂板悓姝ヤ粖鏃ラ槦鍒楋紝璁╄鏆傚仠鐨勫崱鐗囧洖鍒板綋鍓嶅彲澶嶄範闆嗗悎銆?- 鎵╁睍 `backend/internal/modules/card/service/status_test.go`銆乣backend/internal/modules/card/handler/handler_test.go`銆乣frontend-user/src/api/reviewAi.test.ts` 涓?`frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛岀敤 RED/GREEN 鍥炲綊閿佸畾鈥滄殏鍋滃悗绂诲紑浠婃棩娲昏穬闃熷垪銆佹仮澶嶅悗閲嶆柊鍥炲埌闃熷垪鈥濈殑绔埌绔涓恒€?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥滃涔犱細璇濆凡鍏峰鏆傚仠/鎭㈠鍗＄墖鈥濊繖涓€灞傘€?### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/card/handler ./internal/modules/card/service`
- RED锛歚npm --workspace frontend-user run test -- src/api/reviewAi.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚go test ./internal/modules/card/handler ./internal/modules/card/service`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/reviewAi.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `go test ./internal/modules/card/...`
- `npm --workspace frontend-user run test -- src/api/reviewAi.test.ts src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `ANKI-030` 鐨勫涔犱細璇濈幇鍦ㄤ笉浠呰兘鈥滃厛璺宠繃绋嶅悗鍥炴潵鈥濓紝涔熻兘鐪熸鎶婁竴寮犲崱鍏堟殏鍋滃嚭浠婃棩娲昏穬闃熷垪锛屽苟鍦ㄥ悓涓€宸ヤ綔鍙版仮澶嶏紝杩欒鍘熷瀷闃舵鐨勫涔犳帶鍒堕潰鏇存帴杩戠湡瀹炲彲鐢ㄤ骇鍝併€?- 杩欎竴杞粛鐒跺彧瑕嗙洊 `active / suspended` 杩欐潯鏈€灏忕姸鎬侀€氳矾锛涘悗缁洿閫傚悎缁х画娌?`ANKI-030 / ANKI-020 / LC-010` 琛ユ挙閿€涓婁竴娆¤瘎鍒嗐€佸煁钘忚涔夊拰涓庣湡瀹炲涔?澶嶄範/閲嶆柊瀛︿範闃熷垪涓€鑷寸殑璋冨害鐘舵€侊紝鑰屼笉鏄户缁湪鍓嶇浼氳瘽閲屽爢鏇村涓€娆℃€у垎鏀垽鏂€?## 2026-07-15 07:02:37 +08:00 | v1.1.0-alpha.252 | 鎺ㄨ繘 ANKI-030 澶嶄範鍩嬭棌褰撳墠鍗＄墖
### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-030 / LC-010`锛岃繖涓€杞笉鐩存帴灞曞紑瀹屾暣鐨勯槦鍒楅噸鎺掓垨鎾ら攢璇勫垎锛岃€屾槸鍏堟妸澶嶄範鎺у埗闈㈤噷鏈€鍚庝竴涓珮棰戞樉寮忓姩浣滆ˉ鍒板彲鐢ㄣ€?- 鐩爣鏄鐢ㄦ埛鍦ㄥ涔犱腑鍙互鎶婂綋鍓嶅崱鐗囧煁钘忔帀锛岃瀹冨湪浠婂ぉ鐨勬椿璺冮槦鍒楅噷鍏堟秷澶憋紝鍚屾椂浠嶇劧鑳藉湪绠＄悊闈㈡澘涓仮澶嶏紝鍏堝舰鎴愪竴鐗堝彲浣撻獙鐨勫師鍨嬭涔夈€?### 瀹為檯鍙樻洿

- 鍚庣鎵╁睍 `card` 鐘舵€侀€氳矾锛歚UpdateCardStatus(...)` 鐜板凡鎺ュ彈 `active / suspended / buried` 涓夌鐘舵€侊紝`TodayQueue(...)` 浠嶅彧杩斿洖 `active` 鍗＄墖锛屽洜姝よ鍩嬭棌鐨勫崱鐗囦細鍜屾殏鍋滃崱鐗囦竴鏍风寮€浠婃棩娲昏穬闃熷垪銆?- 鏇存柊 `backend/internal/modules/card/service/service.go`锛屾妸 `buried` 绾冲叆鍗＄墖鐘舵€佹牎楠岋紱鐜版湁 `PATCH /api/v1/cards/:id/status` API 鏃犻渶鏂板璺敱鍗冲彲鎵挎帴鍩嬭棌鍔ㄤ綔銆?- 鏇存柊 `frontend-user/src/api/review.ts` 涓?`frontend-user/src/api/reviewAi.test.ts`锛岃鍓嶇鐘舵€佹洿鏂板鎴风涓?API 鍥炲綊鏄惧紡瑕嗙洊 `buried`銆?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛氬涔犲崱鐗囨搷浣滃尯鏂板 `鍩嬭棌褰撳墠鍗＄墖` 鎸夐挳鍜?`B` 蹇嵎閿紱鍩嬭棌鍚庡綋鍓嶅崱鐗囦細浠庝粖鏃ユ椿璺冮槦鍒楃Щ闄ゃ€佸緟瀹屾垚璁℃暟鍚屾鍑忓皯锛屽苟鎻愮ず鈥滀粖澶╀笉浼氬啀鍑虹幇鈥濄€?- 绠＄悊闈㈡澘涓殑鍗＄墖鍒楄〃鐜板湪瀵?`active` 鍗＄墖鍚屾椂鎻愪緵 `鏆傚仠鍗＄墖 / 鍩嬭棌鍗＄墖` 涓や釜鍔ㄤ綔锛涘 `suspended / buried` 鐘舵€佸垯缁熶竴鎻愪緵 `鎭㈠鍗＄墖`锛岃杩欑増鍘熷瀷閲岀殑闃熷垪澶栧崱鐗囬兘鑳藉洖鍒颁粖鏃ラ泦鍚堛€?- 鎵╁睍 `backend/internal/modules/card/service/status_test.go` 涓?`frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛岀敤 RED/GREEN 鍥炲綊閿佸畾鈥滃煁钘忓悗绂诲紑浠婃棩闃熷垪銆佹仮澶嶅悗鍙噸鏂拌繘鍏ラ槦鍒椻€濈殑琛屼负銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥滃涔犱細璇濆凡鍏峰鍩嬭棌褰撳墠鍗＄墖鈥濊繖涓€灞傘€?### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/card/service`
- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚go test ./internal/modules/card/service`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/reviewAi.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `go test ./internal/modules/card/...`
- `npm --workspace frontend-user run test -- src/api/reviewAi.test.ts src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`
### 鍚庣画褰卞搷

- `ANKI-030` 鐨勫涔犱細璇濈幇鍦ㄥ凡缁忓叿澶囪瘎鍒嗐€佽烦杩囥€佹殏鍋溿€佸煁钘忓拰鎭㈠杩欏嚑绫绘渶鏍稿績鐨勬樉寮忔帶鍒跺姩浣滐紝鍘熷瀷闃舵鐨勨€滃厛鍋氫竴鐗堣兘鐢ㄧ殑澶嶄範浣撻獙鈥濇洿瀹屾暣浜嗕竴姝ャ€?- 杩欎竴杞殑鍩嬭棌浠嶇劧鍏堣惤鎴愨€滄寔涔呭寲鐘舵€?+ 绠＄悊闈㈡澘鎭㈠鈥濈殑鍙敤鍘熷瀷锛岃€屼笉鏄畬鏁寸殑 Anki 鏃ュ垏鍩嬭棌璇箟锛涘悗缁洿閫傚悎缁х画娌?`ANKI-030 / ANKI-020 / LC-010` 琛ユ挙閿€涓婁竴娆¤瘎鍒嗭紝浠ュ強鎶?`buried / suspended / learning / review / relearning` 鐨勭湡瀹炶皟搴﹀叧绯昏繘涓€姝ュ仛瀹炪€?## 2026-07-15 07:20:00 +08:00 | v1.1.0-alpha.253 | 鎺ㄨ繘 ANKI-030 鎾ら攢涓婁竴娆¤瘎鍒?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-030 / LC-010`锛岃繖涓€杞笉鍒囧叆鏂扮殑 Note/Card 缁撴瀯鎴栧畬鏁磋皟搴︽ā鍨嬶紝鑰屾槸琛ラ綈澶嶄範浼氳瘽閲屾渶鍚庝竴涓珮棰戜笖鐩存帴褰卞搷绾犻敊浣撻獙鐨勬樉寮忓姩浣溿€?- 鐩爣鏄鐢ㄦ埛鍦ㄥ垰鎻愪氦璇勫垎鍚庯紝浠嶈兘鍦ㄥ綋鍓嶄細璇濋噷鎶婅繖娆¤瘎鍒嗘挙鍥烇紝鎭㈠璇勫垎鍓嶇殑 schedule锛屽苟鎶婂崱鐗囬噸鏂版斁鍥炰粖鏃ラ槦鍒楋紝鑰屼笉鏄彧鑳藉埛鏂伴〉闈㈡垨鎵嬪伐閲嶅缓涓婁笅鏂囥€?### 瀹為檯鍙樻洿

- 鏇存柊 `backend/internal/modules/card/dto/card.go`銆乣repository/repository.go`銆乣service/service.go`銆乣handler/handler.go`銆乣router/router.go`锛岃ˉ榻?`POST /api/v1/cards/:id/review/undo` 绔埌绔摼璺細璇锋眰闇€鎼哄甫 `reviewId` 涓庤瘎鍒嗗墠鐨?`previousSchedule` 蹇収锛屾湇鍔＄浼氭牎楠屽崱鐗囧綊灞炪€佷粎鍏佽鎾ら攢杩欏紶鍗℃渶鏂扮殑涓€娆¤瘎鍒嗭紝骞跺湪浜嬪姟閲屾仮澶?schedule 鍚庡垹闄ゅ搴?review 璁板綍銆?- 鏂板 `card.review.undo` 瀹¤浜嬩欢锛屼繚鎸佹挙閿€璇勫垎浠嶇劧鐣欏湪 `card` 鍩熷唴閮ㄩ棴鐜紝涓嶆妸杩欐潯浼氳瘽閫昏緫鎵╂暎鍒板叾浠栨ā鍧椼€?- 鏇存柊 `frontend-user/src/api/review.ts`銆乣frontend-user/src/api/types.ts` 涓?`frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屾柊澧?`undoReviewCard(...)` API 瀹㈡埛绔€佸涔犻〉鈥滄挙閿€涓婁竴娆¤瘎鍒嗏€濇寜閽紝浠ュ強璇勫垎鍚庝繚鐣欑殑鏈湴 undo 鐘舵€侊紱鎾ら攢鎴愬姛鍚庝細鎭㈠璇勫垎鍓嶇殑璁℃暟銆佹妸鍗＄墖閲嶆柊鏀惧洖浠婃棩闃熷垪澶撮儴锛屽苟缁欏嚭鏄庣‘鍙嶉銆?- 鏇存柊 `frontend-user/src/styles/studio-workspaces.css`锛岃ˉ涓婂涔犳彁绀哄尯涓庢挙閿€鎸夐挳骞舵帓灞曠ず鐨勬牱寮忥紝淇濇寔绌洪槦鍒楀拰姝ｅ父澶嶄範涓ょ鐘舵€佷笅閮借兘瑙﹀彂鎾ら攢銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-030 / LC-010` 鐨勯樁娈垫弿杩版帹杩涘埌鈥滃涔犱細璇濆凡鍏峰鎾ら攢涓婁竴娆¤瘎鍒嗗苟鎭㈠浠婃棩闃熷垪鈥濊繖涓€灞傘€?### 楠岃瘉缁撴灉

- RED锛歚go test ./internal/modules/card/handler ./internal/modules/card/service`
- RED锛歚npm --workspace frontend-user run test -- src/api/reviewAi.test.ts`
- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚go test ./internal/modules/card/handler ./internal/modules/card/service`
- GREEN锛歚npm --workspace frontend-user run test -- src/api/reviewAi.test.ts`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
### 鍚庣画褰卞搷

- `ANKI-030` 鐨勫涔犱細璇濈幇鍦ㄥ凡缁忓叿澶囪瘎鍒嗐€佽烦杩囥€佹殏鍋溿€佸煁钘忋€佹仮澶嶅拰鎾ら攢璇勫垎杩欑粍鏈€鍏抽敭鐨勬樉寮忔帶鍒跺姩浣滐紝鍘熷瀷闃舵鐨勨€滃厛鍋氫竴鐗堣兘鐢ㄧ殑澶嶄範浣撻獙鈥濆張瀹屾暣浜嗕竴姝ャ€?- 杩欎竴杞殑鎾ら攢浠嶇劧寤虹珛鍦ㄢ€滃綋鍓嶄細璇濅繚鐣欒瘎鍒嗗墠 schedule 蹇収 + 浠呭厑璁告挙閿€鏈€鏂颁竴鏉¤瘎鍒嗏€濈殑鏈€灏忔ā鍨嬩笂锛涘悗缁洿閫傚悎缁х画娌?`ANKI-030 / ANKI-020 / LC-010` 鍋氱湡瀹炲涔?澶嶄範/閲嶆柊瀛︿範闃熷垪銆佸煁钘忔棩鍒囪涔変笌鏇寸粺涓€鐨?SourceLink/鍙嶉鍥炲啓锛岃€屼笉鏄户缁妸鏇村璋冨害鎺ㄥ鐣欏湪鍓嶇浼氳瘽鐘舵€侀噷銆?
## 2026-07-15 08:26:07 +08:00 | v1.1.0-alpha.254 | 鎺ㄨ繘 ANKI-040 鍗＄墖娴忚鍣ㄦ湰鍦扮瓫閫変笌鎵归噺鐘舵€佺鐞?### 浠诲姟鍐呭

- 缁х画娌?`CODEX_MASTER_PROMPT.md` 鐨勨€滃厛鎶婁富瀛︿範璺緞鍋氭垚鍙敤鐗堬紝鍐嶉€愭缁嗗寲鈥濇柟鍚戞帹杩?`ANKI-040 / LC-010`锛岃繖涓€杞笉鍏堝垏鍘诲畬鏁寸殑鍚庣杩囨护鎺ュ彛鎴?Note/Card 妯″瀷閲嶆瀯锛岃€屾槸鍏堟妸澶嶄範绠＄悊闈㈡澘閲岀殑鍗＄墖娴忚鍣ㄥ仛鎴愬彲浣撻獙鐨勬渶灏忓師鍨嬨€?- 鐩爣鏄鐢ㄦ埛鍦ㄥ悓涓€澶嶄範宸ヤ綔鍙伴噷鏃㈣兘蹇€熺缉灏忓綋鍓嶇墝缁勪腑鐨勫崱鐗囪寖鍥达紝涔熻兘涓€娆℃€у鐞嗕竴鎵光€滀粖澶╁厛鏆傚仠/鍩嬭棌鈥濇垨鈥滈噸鏂版斁鍥炲涔犻泦鍚堚€濈殑鍗＄墖锛岃€屼笉鏄€愬紶鐐规搷浣溿€?
### 瀹為檯鍙樻洿

- 鍏堢敤 RED/GREEN 淇骞舵墿灞?`frontend-user/src/modules/review/ReviewWorkspacePage.test.tsx`锛屾柊澧炰袱鏉￠〉闈㈢骇鍥炲綊锛氫竴鏉￠攣瀹氬崱鐗囨祻瑙堝櫒鍙寜鍏抽敭璇嶃€佺姸鎬併€佹潵婧愮被鍨嬪仛鏈湴绛涢€夛紱涓€鏉￠攣瀹氬閫夊悗鎵归噺鏆傚仠鍗＄墖浼氬悓姝ョЩ鍑轰粖鏃ラ槦鍒楀苟鏇存柊鍙嶉鏂囨銆?- 鏇存柊 `frontend-user/src/modules/review/ReviewWorkspacePage.tsx`锛屼负澶嶄範绠＄悊闈㈡澘鏂板鍗＄墖娴忚鍣ㄧ姸鎬侊細鏈湴鍏抽敭璇嶇瓫閫夈€佺姸鎬佺瓫閫夈€佹潵婧愮被鍨嬬瓫閫夈€佸彲瑙佺粨鏋滆鏁般€佸閫夐泦鍚堛€佸叏閫夊綋鍓嶇粨鏋滐紝浠ュ強鎵归噺鏆傚仠/鍩嬭棌/鎭㈠閫変腑鍗＄墖鐨勪氦浜掍笌闃熷垪鍚屾閫昏緫銆?- 鎵归噺鏆傚仠/鍩嬭棌浼氬湪鏈湴鍚屾鏇存柊鍗＄墖鐘舵€併€佺Щ闄や粖鏃ラ槦鍒椾腑鐨勫懡涓崱鐗囧苟淇寰呭畬鎴愯鏁帮紱鎵归噺鎭㈠鍒欏鐢ㄧ幇鏈夊洖鍒疯矾寰勶紝閲嶆柊鍚屾鍗＄粍鍗＄墖涓庝粖鏃ュ涔犻槦鍒楋紝閬垮厤鍜屾棦鏈夊崟鍗℃仮澶嶈涓哄垎鍙夈€?- 鏇存柊 `frontend-user/src/styles/studio-workspaces.css`锛岃ˉ涓婂崱鐗囨祻瑙堝櫒绛涢€夊尯銆佹壒閲忔搷浣滃尯銆佸閫夊ご閮ㄥ拰鏉ユ簮绫诲瀷 badge 鐨勬牱寮忥紝璁╂柊澧炴帶鍒堕潰缁х画璐村悎鐜版湁澶嶄範宸ヤ綔鍖哄竷灞€銆?- 鏇存柊 `docs/engineering/CODEX_BACKLOG.md`锛屾妸 `ANKI-040` 璋冩暣涓?`IN_PROGRESS`锛屽苟璁板綍杩欐宸插畬鎴愮殑鏄€滄湰鍦扮瓫閫?+ 鎵归噺鐘舵€佺鐞嗏€濊繖涓€闃舵銆?
### 楠岃瘉缁撴灉

- RED锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- GREEN锛歚npm --workspace frontend-user run test -- src/modules/review/ReviewWorkspacePage.test.tsx`
- `npm --workspace frontend-user run typecheck`
- `npm run build:user`

### 鍚庣画褰卞搷

- `ANKI-040` 鐜板湪涓嶅啀鍙槸鈥滄湁鍗＄墖鍒楄〃鍙偣鈥濓紝澶嶄範绠＄悊闈㈡澘宸茬粡寮€濮嬪叿澶囦竴涓洿鎺ヨ繎鐪熷疄鍗＄墖娴忚鍣ㄧ殑鏈€灏忓叆鍙ｏ紝鑳藉湪涓嶇寮€澶嶄範涓婁笅鏂囩殑鍓嶆彁涓嬪畬鎴愮瓫閫夈€佹壒閲忛€夋嫨鍜岀姸鎬佺鐞嗐€?- 杩欎竴杞粛鐒跺彧瑕嗙洊褰撳墠鐗岀粍涓婄殑鍓嶇鏈湴绛涢€変笌鏈€灏忔壒閲忓姩浣滐紱鍚庣画鏇撮€傚悎缁х画娌?`ANKI-040 / ANKI-020 / LC-010` 琛ュ悗绔垪琛?杩囨护 API銆佹爣绛句笌鍒版湡鏃堕棿绛涢€夈€佹壒閲忕‘璁?澶辫触鏄庣粏鍜屽璁¤拷婧紝鑰屼笉鏄户缁妸鏇撮噸鐨勬暟鎹兘鍔涢兘鐣欏湪鍓嶇鍐呭瓨鎬侀噷銆?