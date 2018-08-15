#!/bin/bash
#
# generates a handful of random images using ImageMagick (so you need it installed, obviously)


BKGCOLOR=( black '#339' '#393' '#933' '#939' '#993' '#339' '#999' )
TXTCOLOR=( white '#ff0' '#0f0' '#0ff' '#f00' '#00f' '#f0f' '#0ff' )

mkdir -p demo-img/

for i in {1..10} ;
do
	echo "image $i"
	let "N=$RANDOM % 8"
	BCOL=${BKGCOLOR[$N]}
	let "N=$RANDOM % 8"
	TCOL=${TXTCOLOR[$N]}

	convert -size 800x600 canvas:$BCOL \
		-fill $TCOL \
		-pointsize 100 \
		-gravity Center \
		-draw "text 0,0 'TEST IMG $i'" \
		 demo-img/slide-$i.png

done

