<?php

namespace App\Controller;

use App\Repository\FundraiserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class OgPreviewController extends AbstractController
{
    #[Route('/cagnottes/{slug}', name: 'og_preview_fundraiser', methods: ['GET'])]
    public function fundraiser(
        string $slug,
        FundraiserRepository $fundraiserRepository,
        #[Autowire('%app.frontend_base_url%')] string $baseUrl,
    ): Response {
        $baseUrl = rtrim($baseUrl, '/');
        $fundraiser = $fundraiserRepository->findPublicBySlug($slug);

        if ($fundraiser === null) {
            return $this->ogResponse('Cagnotte introuvable | Sunu Cagnotte', '', '', $baseUrl.'/banner/banniere.png', $baseUrl.'/cagnottes/'.$slug, Response::HTTP_NOT_FOUND);
        }

        $rawDescription = trim($fundraiser->getDescription());
        $description = mb_strlen($rawDescription) > 160
            ? rtrim(mb_substr($rawDescription, 0, 157)).'...'
            : $rawDescription;

        $coverImage = $fundraiser->getCoverImage();
        $imageUrl = $coverImage ? $baseUrl.$coverImage : $baseUrl.'/banner/banniere.png';

        return $this->ogResponse(
            $fundraiser->getTitle().' | Sunu Cagnotte',
            $fundraiser->getTitle(),
            $description,
            $imageUrl,
            $baseUrl.'/cagnottes/'.$fundraiser->getSlug(),
        );
    }

    private function ogResponse(string $title, string $ogTitle, string $ogDescription, string $ogImage, string $ogUrl, int $status = Response::HTTP_OK): Response
    {
        $e = fn (string $s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $html = '<!DOCTYPE html><html lang="fr"><head>'
            .'<meta charset="UTF-8">'
            .'<title>'.$e($title).'</title>'
            .'<meta property="og:type" content="website"/>'
            .'<meta property="og:site_name" content="Sunu Cagnotte"/>'
            .'<meta property="og:title" content="'.$e($ogTitle).'"/>'
            .'<meta property="og:description" content="'.$e($ogDescription).'"/>'
            .'<meta property="og:image" content="'.$e($ogImage).'"/>'
            .'<meta property="og:url" content="'.$e($ogUrl).'"/>'
            .'<meta property="og:locale" content="fr_SN"/>'
            .'<meta name="twitter:card" content="summary_large_image"/>'
            .'<meta name="twitter:title" content="'.$e($ogTitle).'"/>'
            .'<meta name="twitter:description" content="'.$e($ogDescription).'"/>'
            .'<meta name="twitter:image" content="'.$e($ogImage).'"/>'
            .'<meta http-equiv="refresh" content="0;url='.$e($ogUrl).'"/>'
            .'</head><body></body></html>';

        return new Response($html, $status, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'public, max-age=300',
        ]);
    }
}
