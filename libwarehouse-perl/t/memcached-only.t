#!perl
# -*- mode: perl; perl-indent-level: 4; indent-tabs-mode: nil; -*-

use strict;
use warnings;
use Test::More tests => 14*64*2;
use Warehouse;

SKIP: {
    skip "warehouse client not configured on this machine", 14*64*2 if (! -f "/etc/warehouse/warehouse-client.conf");
    skip "preparing to run a warehouse job", 14*64*2 if exists $ENV{"MR_JOB_ID"};

    my $whc = new Warehouse
        (memcached_size_threshold => 1048576,
         mogilefs_size_threshold => 1048577,
         debug_mogilefs_paths => 1);

    my $check;


    skip "something about 'perl -T' makes fetches hang", 14*64*2 if ${^TAINT};

    my @size;
    my @hash;
    for my $i (0..63)
    {
	my $content = "abcdefghijklmnop";
	for my $e (6..19)
	{
	    $content = $content x 2;

	    push @size, (length($content)+length($i));
	    push @hash, $whc->store_block ($content.$i);
	    ok ($hash[-1] =~ /^[a-f0-9]{32}/, "store_2e${e}_${i}");
	}
    }

    for (@hash)
    {
	my $size = shift @size;
	ok ($whc->fetch_block ($_), "fetch_${size}_${_}");
    }

    print STDERR ("\n" . $whc->iostats);
};
