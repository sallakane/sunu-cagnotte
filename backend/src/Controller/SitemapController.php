<?php

namespace App\Controller;

use App\Repository\FundraiserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SitemapController extends AbstractController
{
    #[Route('/sitemap.xml', name: 'sitemap', methods: ['GET'])]
    public function index(
        FundraiserRepository $fundraiserRepository,
        #[Autowire('%app.frontend_base_url%')] string $baseUrl,
    ): Response {
        $baseUrl = rtrim($baseUrl, '/');

        $staticPages = [
            ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => '/cagnottes', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => '/comment-ca-marche', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => '/qui-sommes-nous', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => '/contact', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/mentions-legales', 'priority' => '0.3', 'changefreq' => 'monthly'],
            ['loc' => '/politique-confidentialite', 'priority' => '0.3', 'changefreq' => 'monthly'],
            ['loc' => '/cgu', 'priority' => '0.3', 'changefreq' => 'monthly'],
        ];

        $fundraisers = $fundraiserRepository->findAllPublished();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($staticPages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>".htmlspecialchars($baseUrl.$page['loc'])."</loc>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        foreach ($fundraisers as $fundraiser) {
            $lastmod = $fundraiser->getUpdatedAt()->format('Y-m-d');
            $xml .= "  <url>\n";
            $xml .= "    <loc>".htmlspecialchars($baseUrl.'/cagnottes/'.$fundraiser->getSlug())."</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return new Response($xml, Response::HTTP_OK, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
