import { Prisma } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { FullDirectorInput, FullProductInput } from './product-full-types';

type Tx = Prisma.TransactionClient;

// Addon/Inclusion/Partner는 재사용하지 않고 패키지마다 매번 새로 생성하기로 함(README 논의 참고)
// Package를 지워도 Prisma의 onDelete: Cascade는 PackageAddon/PackageInclusion/PackagePartner
// "조인 테이블" 행만 지우고, 그 대상인 Addon/Inclusion/Partner 본체는 지우지 않음(cascade 방향이 반대)
// 그래서 전체 교체(PUT) 시엔 지우기 전에 연결된 id를 먼저 모아뒀다가, 조인 테이블이 사라진 뒤 명시적으로 같이 지워야
// 매 수정마다 고아 레코드가 계속 쌓이는 걸 막을 수 있음
async function deleteDirectorTree(tx: Tx, directorIds: number[]) {
  if (directorIds.length === 0) return;
  const packages = await tx.package.findMany({
    where: { directorId: { in: directorIds } },
    select: {
      id: true,
      addons: { select: { addonId: true } },
      inclusions: { select: { inclusionId: true } },
      partners: { select: { partnerId: true } },
    },
  });
  const addonIds = [
    ...new Set(packages.flatMap((p) => p.addons.map((a) => a.addonId))),
  ];
  const inclusionIds = [
    ...new Set(packages.flatMap((p) => p.inclusions.map((i) => i.inclusionId))),
  ];
  const partnerIds = [
    ...new Set(packages.flatMap((p) => p.partners.map((pt) => pt.partnerId))),
  ];

  // Director 삭제 -> ProductDirector/Package/PackageAddon/PackageInclusion/PackagePartner/PackageImage까지 cascade
  await tx.director.deleteMany({ where: { id: { in: directorIds } } });

  // cascade가 안 닿는 Addon/Inclusion/Partner(+PartnerInstagram) 본체를 마저 정리
  if (addonIds.length > 0)
    await tx.addon.deleteMany({ where: { id: { in: addonIds } } });
  if (inclusionIds.length > 0)
    await tx.inclusion.deleteMany({ where: { id: { in: inclusionIds } } });
  if (partnerIds.length > 0)
    await tx.partner.deleteMany({ where: { id: { in: partnerIds } } });
}

async function createDirectors(
  tx: Tx,
  productId: number,
  directors: FullDirectorInput[],
) {
  for (const dir of directors) {
    const director = await tx.director.create({
      data: {
        number: dir.number.trim(),
        name: dir.name.trim(),
        instagram: dir.instagram?.trim() || null,
        location: dir.location,
        category: dir.category,
        order: dir.order,
      },
    });
    await tx.productDirector.create({
      data: { productId, directorId: director.id },
    });

    for (const pkg of dir.packages) {
      // 트랜잭션은 커넥션 하나를 공유하므로 Promise.all로 병렬 실행하면 안 되고 순차적으로 await해야 함
      const addonRecords = [];
      for (const a of pkg.addons) {
        addonRecords.push(
          await tx.addon.create({
            data: {
              name: a.displayName.trim(),
              displayName: a.displayName.trim(),
              price: a.price,
              desc: a.desc?.trim() || null,
              order: a.order,
            },
          }),
        );
      }
      const inclusionRecords = [];
      for (const i of pkg.inclusions) {
        inclusionRecords.push(
          await tx.inclusion.create({
            data: { name: i.name.trim(), order: i.order },
          }),
        );
      }
      const partnerRecords = [];
      for (const p of pkg.partners) {
        partnerRecords.push(
          await tx.partner.create({
            data: {
              role: p.role,
              name: p.displayName.trim(),
              displayName: p.displayName.trim(),
              order: p.order,
              instagramAccounts: {
                create: p.instagramHandles
                  .map((h) => h.trim())
                  .filter(Boolean)
                  .map((handle, idx) => ({ handle, order: idx })),
              },
            },
          }),
        );
      }

      await tx.package.create({
        data: {
          directorId: director.id,
          name: pkg.name.trim(),
          isSinglePrice: pkg.isSinglePrice,
          priceSNS: pkg.priceSNS,
          priceNoSNS: pkg.priceNoSNS,
          shootingTime: pkg.shootingTime.trim(),
          shootingTimeDetail: pkg.shootingTimeDetail?.trim() || null,
          locations: pkg.locations.trim(),
          locationsDetail: pkg.locationsDetail?.trim() || null,
          originalPhotos: pkg.originalPhotos.trim(),
          originalPhotosDetail: pkg.originalPhotosDetail?.trim() || null,
          retouched: pkg.retouched,
          retouchedDetail: pkg.retouchedDetail?.trim() || null,
          order: pkg.order,
          images: {
            create: pkg.images.map((img) => ({
              webUrl: img.originalUrl,
              originalUrl: img.originalUrl,
              thumbUrl: img.thumbUrl || null,
              blurDataUrl: img.blurDataUrl || null,
              order: img.order,
            })),
          },
          addons: {
            create: addonRecords.map((a, idx) => ({
              addonId: a.id,
              order: pkg.addons[idx].order,
            })),
          },
          inclusions: {
            create: inclusionRecords.map((i, idx) => ({
              inclusionId: i.id,
              order: pkg.inclusions[idx].order,
            })),
          },
          partners: {
            create: partnerRecords.map((p, idx) => ({
              partnerId: p.id,
              order: pkg.partners[idx].order,
            })),
          },
        },
      });
    }
  }
}

export async function createFullProduct(
  data: FullProductInput,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const last = await tx.product.findFirst({
      where: { section: data.section },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const product = await tx.product.create({
      data: {
        section: data.section,
        title: data.title.trim(),
        imageUrl: data.imageUrl || null,
        order: (last?.order ?? -1) + 1,
      },
    });
    await createDirectors(tx, product.id, data.directors);
    return product.id;
  });
}

export async function replaceFullProduct(
  productId: number,
  data: FullProductInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existingDirectorIds = (
      await tx.productDirector.findMany({
        where: { productId },
        select: { directorId: true },
      })
    ).map((d) => d.directorId);

    await deleteDirectorTree(tx, existingDirectorIds);

    await tx.product.update({
      where: { id: productId },
      data: {
        section: data.section,
        title: data.title.trim(),
        imageUrl: data.imageUrl || null,
      },
    });
    await createDirectors(tx, productId, data.directors);
  });
}

export async function deleteFullProduct(productId: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existingDirectorIds = (
      await tx.productDirector.findMany({
        where: { productId },
        select: { directorId: true },
      })
    ).map((d) => d.directorId);

    await deleteDirectorTree(tx, existingDirectorIds);
    await tx.product.delete({ where: { id: productId } });
  });
}

export async function getFullProduct(productId: number) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { order: 'asc' } },
      directors: {
        include: {
          director: {
            include: {
              packages: {
                orderBy: { order: 'asc' },
                include: {
                  images: { orderBy: { order: 'asc' } },
                  addons: {
                    orderBy: { order: 'asc' },
                    include: { addon: true },
                  },
                  inclusions: {
                    orderBy: { order: 'asc' },
                    include: { inclusion: true },
                  },
                  partners: {
                    orderBy: { order: 'asc' },
                    include: {
                      partner: {
                        include: {
                          instagramAccounts: { orderBy: { order: 'asc' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function renumberDirectors(
  productId: number,
  order: number,
): Promise<void> {
  const directors = await prisma.director.findMany({
    where: { products: { some: { productId } } },
    orderBy: { order: 'asc' },
  });
  const position = order + 1;
  await Promise.all(
    directors.map((d, i) => {
      const newNumber =
        directors.length > 1 ? `#${position}-${i + 1}` : `#${position}`;
      if (d.number === newNumber) return Promise.resolve();
      return prisma.director.update({
        where: { id: d.id },
        data: { number: newNumber },
      });
    }),
  );
}
