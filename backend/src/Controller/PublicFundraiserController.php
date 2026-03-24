<?php

namespace App\Controller;

use App\Repository\FundraiserRepository;
use App\Service\Fundraiser\FundraiserViewFactory;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/fundraisers')]
class PublicFundraiserController extends AbstractController
{
    #[Route('', name: 'api_public_fundraiser_list', methods: ['GET'])]
    public function list(
        Request $request,
        FundraiserRepository $fundraiserRepository,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $search = trim((string) $request->query->get('q', ''));
        $category = trim((string) $request->query->get('category', ''));

        $fundraisers = array_map(
            $fundraiserViewFactory->buildPublicSummary(...),
            $fundraiserRepository->findPublicPublished(
                $search !== '' ? $search : null,
                $category !== '' ? $category : null,
            ),
        );

        return $this->json([
            'items' => $fundraisers,
            'meta' => [
                'page' => 1,
                'perPage' => 12,
                'total' => count($fundraisers),
            ],
        ]);
    }

    #[Route('/{slug}', name: 'api_public_fundraiser_detail', methods: ['GET'])]
    public function detail(
        string $slug,
        FundraiserRepository $fundraiserRepository,
        FundraiserViewFactory $fundraiserViewFactory,
    ): JsonResponse
    {
        $fundraiser = $fundraiserRepository->findPublicBySlug($slug);

        if ($fundraiser === null) {
            return $this->json([
                'message' => 'Cagnotte introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'item' => $fundraiserViewFactory->buildPublicDetail($fundraiser),
        ]);
    }
}
