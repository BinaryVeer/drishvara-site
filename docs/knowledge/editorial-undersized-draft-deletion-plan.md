# Private Undersized Article Deletion Plan

Status: COMPLETED FOR THE SUBSEQUENTLY AUTHORIZED 45-RECORD SUBSET, 2026-11-05. The original 46-record snapshot below is preserved as historical evidence, not a replayable deletion instruction. No maintenance SQL is supplied by this document.

The publisher requested permanent deletion of private undersized drafts, then explicitly authorized preparation of an exact-scope plan after the proposed general purge was rejected by safety review. This plan does not override that rejection.

## Frozen Scope

- Project: `pajlabwwszmhjhabxprf`.
- Read-only snapshot: `2026-10-30T11:32:26.842404+00:00`.
- Exactly 46 private Article candidates, current copies 246-744 words; all below the inclusive 1,500-word minimum.
- No target has a recorded scope decision or controlled-release request at snapshot time.
- Targets are identified below by candidate, current version and exact content hash. A new version, decision, release or correction request requires re-review; do not broaden the target set automatically.
- Excluded: all 22 Words, all public Article pages and discovery indexes, source/generation modules, historical corpus files, Panchang, account permissions and all unrelated data. Do not delete local user files or private preparation artifacts under this authorization.

## Audit-Loss Decision Required

The immutable versions contain the draft payloads; immutable intake commands also contain those payloads. Deleting only a candidate does not permanently remove its private copies. Existing protections reject deletion, including by the database owner. No browser/RPC purge, grant, trigger change or broad helper was added.

Before an operator can execute a separately reviewed maintenance operation, the publisher must explicitly authorize removal of these exact draft payloads and their corresponding intake-command copies, acknowledging loss of draft recovery and intake replay. Retain a non-content deletion receipt containing the target identifiers/hashes, acting operator, authorization reference, counts and timestamp. Do not erase decisions, release history or administrator event history.

## Required Execution Safeguards

1. Revalidate every current version/hash and every historical version's body length; exclude or stop on any copy at or above 1,500 words.
2. Recheck all decision, release, delivery, correction and foreign-key references. Stop if any exists; no cascade deletion or audit-history removal is authorized.
3. Use a narrowly reviewed exact-target transaction with bounded locking and timeout, not an exposed runtime feature or an unrestricted maintenance function. The mechanism for respecting immutable-history protections must be reviewed and explicitly authorized before execution; this plan does not prescribe disabling them.
4. Test both rollback and success on isolated synthetic PostgreSQL records. Demonstrate unchanged Words, protected audit records, grants, triggers and publication controls.
5. Record the non-content receipt and compare expected/actual counts. Verify the private active queue, protected triggers, Word counts, public assets and publication state afterward.
6. If execution cannot satisfy these requirements, stop. Hiding or archiving is an alternative only with a separate publisher decision, not a substitute silently chosen by the operator.

## Exact Target Register

| Candidate ID | Current Version ID | Content Hash | Body Words |
| --- | --- | --- | ---: |
| `02d8b997-bc74-4e8b-880e-04e08b757539` | `9402c75b-fc23-4c6e-a850-fcc946671d57` | `sha256:e1a1df68230f7c7468d4d8a2cd3d0db1267e825596b9ba12b4b1f36aad1289ca` | 362 |
| `14512f58-9b57-4ae4-97c7-94cb991e2e1d` | `5de8bab9-6e3c-4c50-a068-7c4576b7cbb6` | `sha256:36304c97291c3c2fbb01869e4a955fbe813e1a5773f6f51710e5471f39d19546` | 441 |
| `14ce3b64-9168-4d00-8f26-cbce1c441b5d` | `a14a3346-79ff-4c73-8d90-143b7de62392` | `sha256:9e991d5f7b80f6dd028a6a38d560843c64b9fc7cd62878e6ff38242a5b8fe01b` | 362 |
| `15f7b19f-ca0d-48fa-bdd2-817fb1c1d7e3` | `9ba8e273-7e3d-4621-a0cc-af7ebab3604d` | `sha256:2cebd96016ac9c1e0025dfc13bac3c98bd17f38f17bdc8bce34acf41abf3fd3c` | 319 |
| `17b07623-200b-4837-a5b1-4d039e38a613` | `1b28af44-0e97-4979-a411-5c65f30139d0` | `sha256:fad38c0ca731174c9d717dfa423aeceebe494b09198f32ca4e7f3aa650798690` | 434 |
| `192c9094-bdb3-4701-a13b-b26642f82733` | `a9e3ee09-2387-426a-8a2b-f765357150bb` | `sha256:92453f5cfb359da4ebfb7ce814abf15f0abda4ffa5000ec65df39c95d59afa78` | 376 |
| `22bbf345-dd6d-458f-879f-09f4a05d3f85` | `cfb8f429-eaeb-4e4f-a85c-dfaba8a058a5` | `sha256:ed178e9aeee9cab1ca635e79185c9bb60ec8464544f8fd679de3985f24162ce3` | 375 |
| `22d176cb-f5b8-4f84-b59c-96facccdbb2d` | `a89fa2e0-a21b-489f-84c4-492ef1c3deaa` | `sha256:bf6d9236e94e4a58c5820acc57b563faf7c32621668550d4aea84d02936ceca1` | 724 |
| `25544505-d3bb-476a-9490-330a58e6dd3a` | `d5da9301-f122-49bc-b3bf-6e46cad93a25` | `sha256:a7b28f9ea9c89f0cf0f432a733135bea9aa7388e88018ad66ae4e67fcb384c9c` | 405 |
| `2c429b6f-4d32-4c9b-a69f-2f99bbae3701` | `49aa83b4-8852-4e0a-bfb2-10e09c1ba650` | `sha256:3f667372678b2abbe7412d4948a6b5e5b22ca449c0534e1d4f4baa76f1754c46` | 678 |
| `2d7208a3-2ad6-47cc-a073-acdaa4454632` | `92fcb207-a2dc-4c39-b89c-5fac6642ee25` | `sha256:eaeea72f87930fc995ea9939622e26884bfbb6ce871963e2d201caaef5db076e` | 387 |
| `30e2d6cb-290c-4a9d-bf1e-0c2a72fcde70` | `5ad2168d-e7d0-4a37-b6b2-9b8e3f889724` | `sha256:cb61a8d0d1be174ab750ff053e53536871aca48ffddb8ec57107d88849e460b1` | 358 |
| `3449c488-9957-4653-a2fe-f94598a014be` | `5894f26a-baf8-4291-b14a-7724e80a1f92` | `sha256:625f09aced6c99683d7f8f9622ba056040c87bc9c6ea73042497c77ad5881a55` | 430 |
| `3dad6b79-3ac4-4cc6-81bb-fd6b243b860b` | `32321fb8-d876-4749-a3ad-41067c5b184f` | `sha256:939466205e23b8315c26491a276efec8e84fb6ac33b1e716c80a88fe0f31b25b` | 316 |
| `3e31515a-1d7e-43c9-a94d-8dc6358f29da` | `1c48537f-a9b0-4e9d-9999-3462e02c868b` | `sha256:2c9ecabd24981abd80ed152b25478c5c0b2af2caac3dc58c400cf82b491bbb71` | 378 |
| `3ec190f9-f386-4b8b-b3db-97b2ee37cf15` | `1a1ea8b7-f067-4bb9-b38f-9d018254f1f5` | `sha256:096f74ad0ccf5abd72dde5b9d7ccc988808d48ac8d3487692a0aee76dd17bba2` | 364 |
| `41fe3182-00e8-4241-ad71-18e8e0292adb` | `9925b7ff-d51c-471d-8514-ab3e18265a31` | `sha256:afd5141bba07d968b486f705fbafcbb247cc7072c8095b6b73c1ba916dbdda13` | 284 |
| `47d799e5-2ec9-4a5b-b698-f5c9fb65c444` | `d0eb3e8f-a3eb-44bd-85f7-d9919bfdc745` | `sha256:bcc6a7e5a92ce37f7898345cb523d1a8d02340b4c4838f72cf73cb6fdd7b7de4` | 744 |
| `4cf3ab0a-c35c-44ea-a3ce-35305bcf9bf2` | `21551997-0786-41fb-89a1-c9c46157641a` | `sha256:43f45d06e1ee08ed8475a12b0b5f599ad2fdf52d782b80e7ff9625602c0a5c54` | 345 |
| `4d0568da-2486-429f-b191-b986cb7b12bb` | `65123201-47ca-447e-bc8f-95cbea1585c7` | `sha256:08a2c10aab5cb8ab7ef880b607b537137ad66d7a43c75073a6e08f404dc85dc3` | 266 |
| `4f4ea69f-38a7-4d31-bcf3-60cfd9c0b12b` | `9fe346fe-2125-4324-a18f-23867aa5b8ed` | `sha256:aaa93472e3c2908f3ae42bb618f8a010de7774e3226e152ec8445341f7531985` | 321 |
| `4fbbb39e-e461-416d-acf7-5c508d72b5c6` | `5f412be2-4eca-4c18-890e-a9649c59f5b4` | `sha256:5176471e81215cae0e15e9c3fcb37c6d116a68505dada13241f714c413009172` | 313 |
| `5bef7403-0b37-472e-863c-d8a0cc42357e` | `785191e2-daee-4172-885f-f2d51c244210` | `sha256:ed37d384b7f40b9599f7801bafc81a3ad3457e9ca04e69bee5615673bfec0bad` | 432 |
| `5f5f8368-fac7-4808-a2c9-bd26da31c448` | `72be3084-7888-4a61-96f4-65e8aeb92447` | `sha256:a10b2e94ccd1866954702b64d5205f60098543eb46961c32aadb8ae6fcc707d6` | 664 |
| `6247b4fa-da0e-4ba5-ad21-fbb983954ed8` | `e9db9948-2f55-4598-a114-697183183e69` | `sha256:5cbf0d8078542ab31df32e42c54d2cbad2874233d8f383b06d6ad6c685370656` | 370 |
| `6b3b1e34-a3c1-4b3b-85f0-f16bc72da2fe` | `1099315c-2e66-4566-9855-4522c631d113` | `sha256:56bd2512ed42f4f41777319918f2c81fba1d22ab426c7689cd4dc3d5be552db7` | 377 |
| `7298944e-5e93-4d87-b168-fd49d03e80d3` | `9ceeb8bb-1446-4826-8b5b-7e2c48747ddd` | `sha256:c9e27f1e4cd919bc2f3eb2b4af75a86ce1ed1bda411e0cefade503567adbbab1` | 365 |
| `75f18336-960c-49ab-b26a-2e524fa891c4` | `d4526107-e6e5-4b16-a5e3-a304a44af5ba` | `sha256:0995c382778dd96275431cad86da84a8a634420ca6459d12325cad5b9ada57ea` | 246 |
| `7af90f82-f6ea-4b37-8389-f2b48d0c9df0` | `744118a3-2b02-4c93-b722-865c1338db9c` | `sha256:cb448bd23462cc9d4119d3621312d19ba0717a9df1375b86fb23ba30a5851f97` | 297 |
| `88cb3287-e4f8-4cbc-b868-2d6ed2602a61` | `39f43d13-bf27-4891-9222-abfd9503fbc1` | `sha256:7d9d212aeabd46df34efd3d035af690780249fa32094d7b6219c4599a3576a1e` | 406 |
| `89b35392-5972-44e4-9f1f-1adb29bb1fe8` | `f60571b5-ad92-40db-a94f-80594e2a85ba` | `sha256:728898fae5161bfc1b0726ae8f550d5264c424c74ec7bdbe5ae5913c3d5cb072` | 339 |
| `93228223-2077-4d05-bed4-c0325f3147d0` | `8b2a67cc-1159-4f09-a9f9-fb4f1ccaaf5f` | `sha256:338a50380593b1b22ec431300c54b004cba02461f79ef7b9846a6dc1a3af2969` | 375 |
| `9447218a-5534-4414-9ed3-1e1b9ad27208` | `f29b59b6-8ac8-464e-b00d-009ca4553198` | `sha256:ee2cb94ff84bf34de0c34b0fe648a7007f6ccb527111ff9a2abb6dbd9693c45a` | 394 |
| `a759e635-f4a0-46b4-94b8-ed07f5d25a2a` | `e292669e-f2df-45e9-88d5-21752d3b3d7d` | `sha256:8b9d44cb488e00963692a2ccfceae0d0ee0177519e98bb3e00c5207c31876b24` | 428 |
| `bd7e84ef-3948-481c-8e1f-5182c48ad37c` | `e1336c75-0d68-49b2-9729-173dc816fd8a` | `sha256:a4aed00337195a9753df7d0fec5f16490cde72724b347e940a2dc80cb41ecb27` | 297 |
| `c38aa6f6-7d98-4788-b21f-a973e98261a0` | `dbba3528-0a41-4837-ba74-1c7c30caadc1` | `sha256:ab7c800362bb48d63769921e78c9ce33cc8635e537a00fa23b86bd67163f85c9` | 321 |
| `c54862c9-c425-465f-aedd-57c780944e59` | `0b1dffd9-386a-401e-93e1-992ab7f63e27` | `sha256:f4c28c3eb3f8e9e7aa4aad1eabd35f7a21cdfaa2147aff9e66bffdb26a00985f` | 368 |
| `c5cf284e-b4cd-46fd-aa39-6bf851086c2b` | `ef449e64-4fac-4a8c-9045-32bde81e679e` | `sha256:bd5e2dac5d1e4b9ecd0ea2870ce1a96d8ca10daf8857a680c935c49431f496af` | 314 |
| `c75f5b76-075b-4f33-bcc2-f4e4c0d01d3b` | `23b22fbb-8ddf-47bb-948a-2e1954eb38f0` | `sha256:f54a63ee844e04bd79c7ec462af2694139858c609df7d1a0dc82fdd0d9e8f153` | 302 |
| `d0c52b6b-dd30-459d-b892-d2834fee9f78` | `16a60212-c868-4ba9-bf06-d3dc82bc0e3b` | `sha256:2bdfaffda87a0159f49c86f005553d0e1e63c2c6e9b2f113bda18d3f701b9d89` | 311 |
| `e1ccbe21-1ed9-4761-a96b-0f8c3ff34bea` | `ad82eaef-1067-4578-b047-842686d1cc46` | `sha256:fbc47b3b854ada6d230fe9e86297143e1945f205cb7c8a168c17357859240cd9` | 349 |
| `e74c3ea2-68c0-46fa-9185-f06a8a0c3958` | `67a7d329-d54a-47b7-ab0a-14f402f11912` | `sha256:bf4b0b1b0619442c1079224756f9ddde512d9c93ec6cf52dd4d93b7cc4dad018` | 407 |
| `ed72cf6c-10f3-4b2c-afa6-aee25ced3d2e` | `08a1b4bf-19dc-49a6-b650-d6a4d2b54bf0` | `sha256:7062ecdcabab345dcb9894241586f98e4a0cb09240d065eef9e255df4943e50f` | 318 |
| `f4d7c36c-2816-45f7-bbcf-1b7665d22faf` | `ba6328c5-ff5b-461b-a0f9-7ef9973f9514` | `sha256:73707ed936eb301a0ebcc6776e6e89e0dac9977994b91343f07f7462b8c5b5c9` | 403 |
| `fa9ecdf6-0e8e-42c7-94f9-e4cf3bd79293` | `7c580d9a-f422-42ff-b59c-a1c9f7a1efa5` | `sha256:5660a9266b7620015bf518a6c838ea66d8386414775ccb4210f9f0363933e735` | 278 |
| `fc977237-9f9c-4d62-a2e5-92be04b00e2d` | `3dcd1990-aeb5-4eb4-8db0-410757b2cfe1` | `sha256:d0277e83e4b122290355f4d2d107a0afcf90b19d3fc809c6316058426fcb85f8` | 721 |

At the original plan snapshot, no deletion, hosted schema alteration, publication, scheduling, commit or deployment had been performed.

## Authorized Execution Receipt, 5 November 2026

The publisher separately authorized an exact-scope maintenance exception acknowledging irreversible loss of draft recovery and intake replay. A fresh preflight found actual review decisions and a release request for `fc977237-9f9c-4d62-a2e5-92be04b00e2d` (Welfare State Evolution). The publisher explicitly narrowed authorization to the other 45 unchanged, unreviewed drafts. The retained candidate/version/hash row remains in the original register above solely to preserve the earlier snapshot; it was excluded from execution.

Supabase connector write confirmation expired without presenting its confirmation prompt. The publisher therefore executed the reviewed operator SQL directly in project `pajlabwwszmhjhabxprf`; independent readback confirmed receipt `6335cdd7-7a08-458f-b97e-8975bf2dcccf`, action `delete_exact45_unreviewed_undersized_articles`, at `2026-11-05T03:34:20.039262Z` (09:04:20.039262 IST). The immutable non-content receipt records 45 candidate deletions, 45 version deletions and 45 intake-command deletions, the exact target hashes, actual database operator `postgres`, operator-assisted execution and authorization reference `publisher:2026-11-05:remaining45-maintenance-exception`.

The transaction used bounded exclusive locking and exact candidate/version/hash/word-count bindings. It temporarily paused only the two relevant immutability triggers and restored both before commit. Newly reviewed, released, assigned, changed or differently versioned targets would fail closed. No reusable deletion RPC, broad privilege grant or cascade deletion was introduced.

Readback confirms one retained Article, all 22 Words, the same 18 decisions and one release request. Before/after fingerprints match for Word versions, the retained Article, decisions, release requests, account permissions, administrator records and delivery controls. Both `immutable_versions` and `immutable_commands` are enabled. Public Article files, discovery indexes, generation modules, Panchang and `prototypes/` were not deleted. Eleven real isolated PostgreSQL cleanup tests covered exact scope, unauthorized roles, changed inputs, rollback after deletion, trigger restoration, preservation and replay rejection; the disposable container and tmpfs data were removed.

Do not rerun the maintenance SQL: the completed receipt deliberately rejects replay. This cleanup supplied no content approval or publication authorization.
